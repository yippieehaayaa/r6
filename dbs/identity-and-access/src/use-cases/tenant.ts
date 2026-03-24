// ============================================================
//  tenant.ts
//  Use cases for the Tenant model.
//
//  Constraints enforced here (from schema):
//    @@unique([name])
//    @@unique([slug])
//    @@index([isActive])
//    @@index([deletedAt])
//    deletedAt soft-delete — records are never hard-deleted
//    moduleAccess String[]  — Prisma requires explicit set: []
//    costingMethod default "FIFO"
//    defaultCurrency default "PHP"
//    vatRegistered default false
// ============================================================

import type { Tenant } from "../../generated/prisma/client";
import { prisma } from "../client";
import type { CreateTenantInput, UpdateTenantInput } from "./types";

// ─── Create ──────────────────────────────────────────────────

// Inserts a new Tenant row.
// Throws P2002 (unique constraint) if name or slug already exists.
export async function createTenant(input: CreateTenantInput): Promise<Tenant> {
  return prisma.tenant.create({
    data: {
      name: input.name,
      slug: input.slug,
      moduleAccess: { set: input.moduleAccess },
      costingMethod: input.costingMethod ?? "FIFO",
      defaultCurrency: input.defaultCurrency ?? "PHP",
      vatRegistered: input.vatRegistered ?? false,
      vatNumber: input.vatNumber,
    },
  });
}

// ─── Read ────────────────────────────────────────────────────

// Finds an active (non-deleted) tenant by primary key.
// Returns null if not found or soft-deleted.
export async function getTenantById(id: string): Promise<Tenant | null> {
  return prisma.tenant.findFirst({
    where: { id, deletedAt: null },
  });
}

// Finds an active tenant by its unique slug.
// Returns null if not found or soft-deleted.
export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
  return prisma.tenant.findFirst({
    where: { slug, deletedAt: null },
  });
}

// Finds an active tenant by its unique name.
export async function getTenantByName(name: string): Promise<Tenant | null> {
  return prisma.tenant.findFirst({
    where: { name, deletedAt: null },
  });
}

// Returns all active tenants.
// @@index([isActive]) supports this query.
export async function listActiveTenants(): Promise<Tenant[]> {
  return prisma.tenant.findMany({
    where: { isActive: true, deletedAt: null },
    orderBy: { name: "asc" },
  });
}

// Returns all tenants regardless of active/deleted state.
// Used by platform admins only.
export async function listAllTenants(): Promise<Tenant[]> {
  return prisma.tenant.findMany({
    orderBy: { createdAt: "desc" },
  });
}

// ─── Update ──────────────────────────────────────────────────

// Updates mutable fields on an existing tenant.
// Throws P2002 if updated name or slug collides with another tenant.
// Throws P2025 if the tenant does not exist.
export async function updateTenant(
  id: string,
  input: UpdateTenantInput,
): Promise<Tenant> {
  return prisma.tenant.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.slug !== undefined && { slug: input.slug }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
      ...(input.costingMethod !== undefined && {
        costingMethod: input.costingMethod,
      }),
      ...(input.defaultCurrency !== undefined && {
        defaultCurrency: input.defaultCurrency,
      }),
      ...(input.vatRegistered !== undefined && {
        vatRegistered: input.vatRegistered,
      }),
      ...(input.vatNumber !== undefined && { vatNumber: input.vatNumber }),
      // moduleAccess uses Prisma's set: [] to replace the full array
      ...(input.moduleAccess !== undefined && {
        moduleAccess: { set: input.moduleAccess },
      }),
    },
  });
}

// ─── Soft delete ─────────────────────────────────────────────

// Soft-deletes a tenant by setting deletedAt.
// @@index([deletedAt]) supports filtering these out in reads.
// Does NOT cascade — dependent Identity rows are left intact.
// The caller is responsible for deactivating identities separately.
export async function softDeleteTenant(id: string): Promise<Tenant> {
  return prisma.tenant.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false },
  });
}

// Restores a soft-deleted tenant.
export async function restoreTenant(id: string): Promise<Tenant> {
  return prisma.tenant.update({
    where: { id },
    data: { deletedAt: null, isActive: true },
  });
}
