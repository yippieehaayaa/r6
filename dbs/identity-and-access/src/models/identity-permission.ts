// ============================================================
//  identity-permission.ts
//  Use cases for the IdentityPermission model (per-user permission grants).
//
//  Constraints enforced here (from schema):
//    @@unique([identityId, permission]) — one row per permission per identity
//    @@index([tenantId])
//    @@index([identityId])
//    tenantId non-nullable — all grants are tenant-scoped
//
//  The system is deny-by-default. A row in this table grants the permission;
//  removing the row revokes it.
// ============================================================

import type { IdentityPermission } from "../../generated/prisma/client.js";
import { prisma } from "../client.js";
import { buildPaginationQuery, type PaginatedResult } from "./shared.js";
import type {
  CreateIdentityPermissionInput,
  ListIdentityPermissionsInput,
} from "./types.js";

// ─── Create / upsert ─────────────────────────────────────────

// Creates a permission grant for an identity.
// Uses upsert on @@unique([identityId, permission]) — safe to call
// repeatedly; a no-op if the row already exists (update has no fields to change).
const upsertIdentityPermission = async (
  input: CreateIdentityPermissionInput,
): Promise<IdentityPermission> => {
  return prisma.identityPermission.upsert({
    where: {
      identityId_permission: {
        identityId: input.identityId,
        permission: input.permission,
      },
    },
    create: {
      tenantId: input.tenantId,
      identityId: input.identityId,
      permission: input.permission,
    },
    update: {},
  });
};

// ─── Read ────────────────────────────────────────────────────

// Finds a single grant by identity + exact permission string, scoped to tenant.
const getIdentityPermission = async (
  identityId: string,
  tenantId: string,
  permission: string,
): Promise<IdentityPermission | null> => {
  return prisma.identityPermission.findFirst({
    where: { identityId, tenantId, permission },
  });
};

// ─── Paginated list ──────────────────────────────────────────

// Returns all permission grants for a specific identity, paginated.
// @@index([identityId]) backs this query.
const listIdentityPermissions = async (
  input: ListIdentityPermissionsInput,
): Promise<PaginatedResult<IdentityPermission>> => {
  const { skip, take } = buildPaginationQuery(input);
  const where = { identityId: input.identityId, tenantId: input.tenantId };

  const [data, total] = await Promise.all([
    prisma.identityPermission.findMany({
      where,
      skip,
      take,
      orderBy: { permission: "asc" },
    }),
    prisma.identityPermission.count({ where }),
  ]);

  return { data, total, page: input.page, limit: input.limit };
};

// Returns every permission grant for a specific identity without pagination.
// Use this when you need the full set (e.g. building a permission matrix UI).
// @@index([identityId]) backs this query.
const getAllIdentityPermissions = async (
  identityId: string,
  tenantId: string,
): Promise<IdentityPermission[]> => {
  return prisma.identityPermission.findMany({
    where: { identityId, tenantId },
    orderBy: { permission: "asc" },
  });
};

// ─── Delete ──────────────────────────────────────────────────

// Removes a specific permission grant.
// Uses deleteMany with tenantId to prevent cross-tenant deletion.
const deleteIdentityPermission = async (
  identityId: string,
  tenantId: string,
  permission: string,
): Promise<void> => {
  await prisma.identityPermission.deleteMany({
    where: { identityId, tenantId, permission },
  });
};

// Removes all permission grants for an identity (e.g. on role reassignment).
const deleteAllIdentityPermissions = async (
  identityId: string,
  tenantId: string,
): Promise<void> => {
  await prisma.identityPermission.deleteMany({
    where: { identityId, tenantId },
  });
};

// ─── Bulk create ─────────────────────────────────────────────

// Stamps multiple permission rows for an identity from a Policy's
// permissions array. Skips duplicates via skipDuplicates — safe to call
// repeatedly (idempotent on the unique index).
const createManyIdentityPermissions = async (
  rows: Array<{
    identityId: string;
    tenantId: string;
    permission: string;
  }>,
): Promise<void> => {
  await prisma.identityPermission.createMany({
    data: rows,
    skipDuplicates: true,
  });
};

// Removes all grants for the given specific permission strings.
// Called when a policy is un-assigned from an identity.
const deleteIdentityPermissionsByPermissions = async (
  identityId: string,
  tenantId: string,
  permissions: string[],
): Promise<void> => {
  await prisma.identityPermission.deleteMany({
    where: { identityId, tenantId, permission: { in: permissions } },
  });
};

// Atomically replaces ALL permission grants for an identity.
// Called by the "set-policies" route which treats the provided policyIds
// as the canonical full list — any permissions not covered are removed.
const setPoliciesForIdentity = async (
  identityId: string,
  tenantId: string,
  allPermissions: string[],
): Promise<void> => {
  await prisma.$transaction(async (tx) => {
    await tx.identityPermission.deleteMany({ where: { identityId, tenantId } });
    if (allPermissions.length > 0) {
      await tx.identityPermission.createMany({
        data: allPermissions.map((permission) => ({
          identityId,
          tenantId,
          permission,
        })),
        skipDuplicates: true,
      });
    }
  });
};

export {
  upsertIdentityPermission,
  getIdentityPermission,
  listIdentityPermissions,
  getAllIdentityPermissions,
  deleteIdentityPermission,
  deleteAllIdentityPermissions,
  createManyIdentityPermissions,
  deleteIdentityPermissionsByPermissions,
  setPoliciesForIdentity,
};
