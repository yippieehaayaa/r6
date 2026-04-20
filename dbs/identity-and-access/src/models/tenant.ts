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
      ownerId: input.ownerId,
      // moduleAccess is a Postgres enum[] — Prisma requires set: []
      moduleAccess: { set: input.moduleAccess },
    },
  });
};

// ─── Create with defaults ─────────────────────────────────────────────────────

// Atomically creates a Tenant (linked to an existing owner identity) and
// stamps permissions onto that owner. The owner Identity must already exist
// (e.g. self-registered + email verified) before calling this function.
//
// Flow inside the transaction:
//   1. Fetch the owner identity (ensures it exists and is not soft-deleted).
//   2. Create the Tenant with ownerId set immediately; isActive mirrors the
//      owner's isEmailVerified so unverified owners start with an inactive tenant.
//   3. Update the owner identity's tenantId to the new tenant's id.
//   4. Stamp ownerPermissions as direct IdentityPermission rows.
//
// ownerPermissions — permission strings to stamp. Defaults to ["iam:*:*"].
//
// Returns: { tenant, ownerIdentity }
const createTenantWithDefaults = async (
  input: CreateTenantInput,
  ownerPermissions: readonly string[] = ["iam:*:*"],
): Promise<{ tenant: Tenant; ownerIdentity: Identity }> => {
  return prisma.$transaction(async (tx) => {
    // Owner must exist and not be soft-deleted.
    const ownerIdentity = await tx.identity.findFirstOrThrow({
      where: { id: input.ownerId, deletedAt: null },
    });

    const tenant = await tx.tenant.create({
      data: {
        name: input.name,
        slug: input.slug,
        ownerId: input.ownerId,
        isActive: ownerIdentity.isEmailVerified,
        moduleAccess: { set: input.moduleAccess },
      },
    });

    // Bind the owner identity to this tenant.
    const updatedOwner = await tx.identity.update({
      where: { id: input.ownerId },
      data: { tenantId: tenant.id },
    });

    // Stamp permissions directly onto the owner identity.
    if (ownerPermissions.length > 0) {
      await tx.identityPermission.createMany({
        data: ownerPermissions.map((permission) => ({
          tenantId: tenant.id,
          identityId: input.ownerId,
          permission,
        })),
        skipDuplicates: true,
      });
    }

    return { tenant, ownerIdentity: updatedOwner };
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
