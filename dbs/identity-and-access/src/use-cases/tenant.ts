// ============================================================
//  tenant.ts
//  Use cases for the Tenant model.
//
//  Constraints enforced here (from schema):
//    @@unique([name])
//    @@unique([slug])
//    @@index([isActive])
//    @@index([deletedAt])
//    moduleAccess String[] — Prisma requires explicit set: []
//    deletedAt soft-delete — records are never hard-deleted
//
//  Financial config (costingMethod, currency, VAT) does not
//  live here — that belongs to the Financial Service.
// ============================================================

import type { Tenant } from "../../generated/prisma/client.js";
import { prisma } from "../client.js";
import type {
  CreateTenantInput,
  ListTenantsInput,
  PaginatedResult,
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

// ─── Create ──────────────────────────────────────────────────

// Inserts a new Tenant row.
// Throws P2002 if name or slug already exists (@@unique on both).
const createTenant = async (input: CreateTenantInput): Promise<Tenant> => {
  return prisma.tenant.create({
    data: {
      name: input.name,
      slug: input.slug,
      // moduleAccess is a Postgres text[] — Prisma requires set: []
      moduleAccess: { set: input.moduleAccess },
    },
  });
};

// ─── Create with defaults ─────────────────────────────────────────────────────

// Platform-level policies automatically connected to the tenant-owner role
// on every new tenant. Names must match the seed (tenantId = null).
const TENANT_OWNER_DEFAULT_POLICIES = [
  "iam:identity:full-access",
  "iam:role:full-access",
  "iam:policy:full-access",
] as const;

// Platform-level policies automatically connected to the tenant-admin role
// on every new tenant. Names must match the seed (tenantId = null).
const TENANT_ADMIN_DEFAULT_POLICIES = [
  "iam:identity:full-access",
  "iam:role:full-access",
  "iam:policy:read-only",
] as const;

// Atomically creates a Tenant, its two standard protected roles
// (tenant-owner and tenant-admin), and a bootstrapped tenant-owner
// identity using the pre-computed password hash/salt.
//
// The owner's username is derived from the slug: "${slug.slice(0,58)}-owner"
// (capped so the total stays within the 64-char username limit).
//
// Caller is responsible for pre-computing hash + salt (bcrypt is async and
// cannot run safely inside a Prisma interactive transaction callback).
//
// Returns: { tenant, ownerUsername }
const createTenantWithDefaults = async (
  input: CreateTenantInput,
  ownerHash: string,
  ownerSalt: string,
): Promise<{ tenant: Tenant; ownerUsername: string }> => {
  return prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: {
        name: input.name,
        slug: input.slug,
        moduleAccess: { set: input.moduleAccess },
      },
    });

    // Roles + default policy lookups are independent — run in parallel.
    const [ownerRole, adminRole, ownerPolicies, adminPolicies] =
      await Promise.all([
        tx.role.create({
          data: {
            tenantId: tenant.id,
            name: "tenant-owner",
            description:
              "Tenant owner — bootstrapped at tenant creation. Unique per tenant.",
          },
        }),
        tx.role.create({
          data: {
            tenantId: tenant.id,
            name: "tenant-admin",
            description: "Tenant administrator — full IAM management access.",
          },
        }),
        tx.policy.findMany({
          where: {
            tenantId: null,
            name: { in: [...TENANT_OWNER_DEFAULT_POLICIES] },
          },
          select: { id: true },
        }),
        tx.policy.findMany({
          where: {
            tenantId: null,
            name: { in: [...TENANT_ADMIN_DEFAULT_POLICIES] },
          },
          select: { id: true },
        }),
      ]);

    const ownerUsername = `${tenant.slug.slice(0, 58)}-owner`;

    // Owner identity creation and role policy assignments are independent.
    await Promise.all([
      tx.identity.create({
        data: {
          tenantId: tenant.id,
          username: ownerUsername,
          email: null,
          hash: ownerHash,
          salt: ownerSalt,
          kind: "USER",
          status: "ACTIVE",
          mustChangePassword: true,
          roles: { connect: { id: ownerRole.id } },
        },
      }),
      ownerPolicies.length > 0
        ? tx.role.update({
            where: { id: ownerRole.id },
            data: { policies: { connect: ownerPolicies } },
          })
        : Promise.resolve(),
      adminPolicies.length > 0
        ? tx.role.update({
            where: { id: adminRole.id },
            data: { policies: { connect: adminPolicies } },
          })
        : Promise.resolve(),
    ]);

    return { tenant, ownerUsername };
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
  const skip = (input.page - 1) * input.limit;

  const [data, total] = await Promise.all([
    prisma.tenant.findMany({
      where,
      skip,
      take: input.limit,
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
