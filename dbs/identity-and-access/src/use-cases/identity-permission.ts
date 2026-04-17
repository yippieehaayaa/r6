// ============================================================
//  identity-permission.ts
//  Use cases for the IdentityPermission model (per-user overrides).
//
//  Constraints enforced here (from schema):
//    @@unique([identityId, permission]) — one override row per permission
//    @@index([tenantId])
//    @@index([identityId])
//    tenantId non-nullable — all overrides are tenant-scoped
//    effect PolicyEffect  — ALLOW to add, DENY to remove
//
//  Resolution order (applied in buildTokenClaims after migration):
//    1. Collect permissions from all active roles.
//    2. Add identity ALLOW overrides.
//    3. Remove identity DENY overrides (DENY always wins).
//
//  NOTE: Requires `prisma migrate dev` to be run first to generate
//  the IdentityPermission model in the Prisma client.
// ============================================================

import type { IdentityPermission } from "../../generated/prisma/client.js";
import { prisma } from "../client.js";
import { buildPaginationQuery, type PaginatedResult } from "./shared.js";
import type {
  CreateIdentityPermissionInput,
  ListIdentityPermissionsInput,
  UpdateIdentityPermissionInput,
} from "./types.js";

// ─── Create / upsert ─────────────────────────────────────────

// Creates or updates a permission override for an identity.
// Uses upsert on @@unique([identityId, permission]) — safe to call
// repeatedly; only the effect changes if the row already exists.
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
      effect: input.effect,
    },
    update: {
      effect: input.effect,
    },
  });
};

// ─── Read ────────────────────────────────────────────────────

// Finds a single override by identity + exact permission string.
// Uses @@unique([identityId, permission]) index.
const getIdentityPermission = async (
  identityId: string,
  permission: string,
): Promise<IdentityPermission | null> => {
  return prisma.identityPermission.findUnique({
    where: { identityId_permission: { identityId, permission } },
  });
};

// ─── Paginated list ──────────────────────────────────────────

// Returns all permission overrides for a specific identity, paginated.
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

// ─── Update ──────────────────────────────────────────────────

// Updates the effect of an existing override.
// Throws P2025 if no override row exists for [identityId, permission].
const updateIdentityPermission = async (
  identityId: string,
  permission: string,
  input: UpdateIdentityPermissionInput,
): Promise<IdentityPermission> => {
  return prisma.identityPermission.update({
    where: { identityId_permission: { identityId, permission } },
    data: { effect: input.effect },
  });
};

// ─── Delete ──────────────────────────────────────────────────

// Removes a specific permission override, returning the identity to
// their role-derived baseline for that permission.
// Throws P2025 if the override does not exist.
const deleteIdentityPermission = async (
  identityId: string,
  permission: string,
): Promise<void> => {
  await prisma.identityPermission.delete({
    where: { identityId_permission: { identityId, permission } },
  });
};

// Removes all overrides for an identity (e.g. on role reassignment).
const deleteAllIdentityPermissions = async (
  identityId: string,
): Promise<void> => {
  await prisma.identityPermission.deleteMany({ where: { identityId } });
};

export {
  upsertIdentityPermission,
  getIdentityPermission,
  listIdentityPermissions,
  updateIdentityPermission,
  deleteIdentityPermission,
  deleteAllIdentityPermissions,
};
