// ============================================================
//  tenant.ts
//  Use cases for the Tenant model.
//
//  Constraints enforced here (from schema):
//    @@unique([name])
//    @@unique([slug])
//    @@index([isActive])
//    @@index([isPlatform])
//    @@index([deletedAt])
//    moduleAccess TenantModule[] — Prisma requires explicit set: []
//    deletedAt soft-delete — records are never hard-deleted
//
//  Financial config (costingMethod, currency, VAT) does not
//  live here — that belongs to the Financial Service.
// ============================================================

import type { Identity, Tenant } from "../../generated/prisma/client.js";
import { prisma } from "../client.js";
import type { PaginatedResult } from "./shared.js";
import { buildPaginationQuery } from "./shared.js";
import type {
  CreateTenantInput,
  ListTenantsInput,
  UpdateTenantInput,
} from "./types.js";

// ─── Helpers ─────────────────────────────────────────────────

const buildWhere = (
  input: Omit<ListTenantsInput, "page" | "limit">,
): import("../../generated/prisma/client.js").Prisma.TenantWhereInput => ({
  ...(input.isActive !== undefined && { isActive: input.isActive }),
  ...(!input.includeDeleted && { deletedAt: null }),
  ...(input.search !== undefined &&
    input.search.length > 0 && {
      OR: [
        { name: { contains: input.search, mode: "insensitive" } },
        { slug: { contains: input.search, mode: "insensitive" } },
      ],
    }),
});

// ─── Platform tenant ─────────────────────────────────────────

// Returns the single platform tenant (isPlatform = true).
// Throws if the platform tenant has not been bootstrapped yet.
// Used by login (ADMIN path) and any caller that needs to resolve
// the platform tenantId without knowing it in advance.
const getPlatformTenantOrFail = async (): Promise<Tenant> => {
  return prisma.tenant.findFirstOrThrow({
    where: { isPlatform: true, deletedAt: null },
  });
};

// ─── Create ──────────────────────────────────────────────────

// Inserts a new Tenant row.
// Throws P2002 if name or slug already exists (@@unique on both).
const createTenant = async (input: CreateTenantInput): Promise<Tenant> => {
  return prisma.tenant.create({
    data: {
      name: input.name,
      slug: input.slug,
      // moduleAccess is a Postgres enum[] — Prisma requires set: []
      moduleAccess: { set: input.moduleAccess },
    },
  });
};

// ─── Create with defaults ─────────────────────────────────────────────────────

// Atomically creates a Tenant and a bootstrapped tenant-owner identity,
// then stamps permissions directly onto the owner.
//
// ownerPermissions — permission strings to stamp onto the owner identity.
//   Defaults to ["iam:*:*"] if not provided.
//
// The owner's username is derived from the slug: "${slug.slice(0,58)}-owner"
// (capped so the total stays within the 64-char username limit).
//
// Caller is responsible for pre-computing hash + salt (bcrypt is async and
// cannot run safely inside a Prisma interactive transaction callback).
//
// Returns: { tenant, ownerIdentity }
const createTenantWithDefaults = async (
  input: CreateTenantInput,
  ownerHash: string,
  ownerSalt: string,
  ownerEmail: string | null,
  ownerPermissions: readonly string[] = ["iam:*:*"],
): Promise<{ tenant: Tenant; ownerIdentity: Identity }> => {
  return prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: {
        name: input.name,
        slug: input.slug,
        moduleAccess: { set: input.moduleAccess },
      },
    });

    const ownerUsername = `${tenant.slug.slice(0, 58)}-owner`;

    // Create the owner identity first so we can back-patch ownerId on tenant.
    const ownerIdentity = await tx.identity.create({
      data: {
        tenantId: tenant.id,
        username: ownerUsername,
        email: ownerEmail,
        hash: ownerHash,
        salt: ownerSalt,
        kind: "USER",
        status: "ACTIVE",
        mustChangePassword: false,
      },
    });

    // Stamp permissions directly onto the owner identity.
    if (ownerPermissions.length > 0) {
      await tx.identityPermission.createMany({
        data: ownerPermissions.map((permission) => ({
          tenantId: tenant.id,
          identityId: ownerIdentity.id,
          permission,
          effect: "ALLOW",
        })),
        skipDuplicates: true,
      });
    }

    // Back-patch ownerId now that the owner identity exists.
    const updatedTenant = await tx.tenant.update({
      where: { id: tenant.id },
      data: { ownerId: ownerIdentity.id },
    });

    return { tenant: updatedTenant, ownerIdentity };
  });
};

// ─── Read ────────────────────────────────────────────────────

// Finds a non-deleted tenant by primary key.
const getTenantById = async (id: string): Promise<Tenant | null> => {
  return prisma.tenant.findFirst({
    where: { id, deletedAt: null },
  });
};

// Finds a non-deleted tenant by unique slug.
// Uses @@unique([slug]).
const getTenantBySlug = async (slug: string): Promise<Tenant | null> => {
  return prisma.tenant.findFirst({
    where: { slug, deletedAt: null },
  });
};

// Finds a non-deleted tenant by unique name.
// Uses @@unique([name]).
const getTenantByName = async (name: string): Promise<Tenant | null> => {
  return prisma.tenant.findFirst({
    where: { name, deletedAt: null },
  });
};

// ─── Paginated list ──────────────────────────────────────────

// Returns a paginated list of tenants.
// isActive filter uses @@index([isActive]).
// includeDeleted = false (default) filters via @@index([deletedAt]).
// Runs findMany + count in parallel — same pattern as listMovements.
const listTenants = async (
  input: ListTenantsInput,
): Promise<PaginatedResult<Tenant>> => {
  const where = buildWhere(input);
  const { skip, take } = buildPaginationQuery(input);

  const [data, total] = await Promise.all([
    prisma.tenant.findMany({
      where,
      skip,
      take,
      orderBy: { name: "asc" },
    }),
    prisma.tenant.count({ where }),
  ]);

  return { data, total, page: input.page, limit: input.limit };
};

// ─── Update ──────────────────────────────────────────────────

// Updates mutable fields.
// Throws P2002 if updated name or slug collides.
// Throws P2025 if the tenant does not exist.
const updateTenant = async (
  id: string,
  input: UpdateTenantInput,
): Promise<Tenant> => {
  return prisma.tenant.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.slug !== undefined && { slug: input.slug }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
      ...(input.moduleAccess !== undefined && {
        moduleAccess: { set: input.moduleAccess },
      }),
    },
  });
};

// ─── Soft delete ─────────────────────────────────────────────

// Soft-deletes a tenant. Sets deletedAt + isActive = false atomically.
// Does NOT cascade — dependent Identity rows are left intact.
const softDeleteTenant = async (id: string): Promise<Tenant> => {
  return prisma.tenant.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false },
  });
};

// Restores a soft-deleted tenant.
const restoreTenant = async (id: string): Promise<Tenant> => {
  return prisma.tenant.update({
    where: { id },
    data: { deletedAt: null, isActive: true },
  });
};

export {
  getPlatformTenantOrFail,
  createTenant,
  createTenantWithDefaults,
  getTenantById,
  getTenantBySlug,
  getTenantByName,
  listTenants,
  updateTenant,
  softDeleteTenant,
  restoreTenant,
};
