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
  getTenantById,
  getTenantBySlug,
  getTenantByName,
  listTenants,
  updateTenant,
  softDeleteTenant,
  restoreTenant,
};
