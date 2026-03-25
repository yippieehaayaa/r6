// ============================================================
//  identity.ts
//  Use cases for the Identity model.
//
//  Constraints enforced here (from schema):
//    @@unique([tenantId, username])   — username unique per tenant
//    @@unique([tenantId, email])      — email unique per tenant
//    @@index([tenantId])
//    @@index([tenantId, status])
//    @@index([tenantId, kind])
//    @@index([deletedAt])
//    tenantId nullable               — null only for ADMIN kind
//    roles Role[]                    — many-to-many implicit join
//    mustChangePassword default true
//    failedLoginAttempts default 0
//    status default PENDING_VERIFICATION
//    kind default USER
//    deletedAt soft-delete
// ============================================================

import { encryptPassword, verifyPassword } from "@r6/bcrypt";
import type { Identity, Prisma, Role } from "../../generated/prisma/client";
import { prisma } from "../client";
import type {
  AssignRoleInput,
  ChangePasswordInput,
  CreateIdentityInput,
  ListIdentitiesInput,
  PaginatedResult,
  UpdateIdentityInput,
} from "./types";

// ─── Create ──────────────────────────────────────────────────

// Inserts a new Identity row.
// Throws P2002 if [tenantId, username] or [tenantId, email] already exists.
// hash and salt must be pre-computed by the caller.
export async function createIdentity(
  input: CreateIdentityInput,
): Promise<Identity> {
  const { hash, salt } = await encryptPassword(input.password);

  return prisma.identity.create({
    data: {
      tenantId: input.tenantId,
      username: input.username,
      email: input.email,
      hash,
      salt,
      kind: input.kind ?? "USER",
      mustChangePassword: input.mustChangePassword ?? true,
    },
  });
}

// ─── Read ────────────────────────────────────────────────────

// Finds a non-deleted identity by primary key.
export async function getIdentityById(id: string): Promise<Identity | null> {
  return prisma.identity.findFirst({
    where: { id, deletedAt: null },
  });
}

// Finds a non-deleted identity by [tenantId, username].
// Uses @@unique([tenantId, username]) index.
export async function getIdentityByUsername(
  tenantId: string | null,
  username: string,
): Promise<Identity | null> {
  return prisma.identity.findFirst({
    where: { tenantId, username, deletedAt: null },
  });
}

// Finds a non-deleted identity by [tenantId, email].
// Uses @@unique([tenantId, email]) index.
export async function getIdentityByEmail(
  tenantId: string | null,
  email: string,
): Promise<Identity | null> {
  return prisma.identity.findFirst({
    where: { tenantId, email, deletedAt: null },
  });
}

// Returns a non-deleted identity with its assigned roles included.
// Roles relation is many-to-many via implicit join table.
export async function getIdentityWithRoles(
  id: string,
): Promise<(Identity & { roles: Role[] }) | null> {
  return prisma.identity.findFirst({
    where: { id, deletedAt: null },
    include: { roles: true },
  });
}

// ─── Paginated list ──────────────────────────────────────────

const buildWhere = (
  input: Omit<ListIdentitiesInput, "page" | "limit">,
): Prisma.IdentityWhereInput => ({
  tenantId: input.tenantId,
  deletedAt: null,
  ...(input.status !== undefined && { status: input.status }),
  ...(input.kind !== undefined && { kind: input.kind }),
});

// Returns a paginated list of identities for a tenant.
// status filter uses @@index([tenantId, status]).
// kind filter uses @@index([tenantId, kind]).
// Runs findMany + count in parallel — same pattern as listMovements.
export async function listIdentities(
  input: ListIdentitiesInput,
): Promise<PaginatedResult<Identity>> {
  const where = buildWhere(input);
  const skip = (input.page - 1) * input.limit;

  const [data, total] = await Promise.all([
    prisma.identity.findMany({
      where,
      skip,
      take: input.limit,
      orderBy: { username: "asc" },
    }),
    prisma.identity.count({ where }),
  ]);

  return { data, total, page: input.page, limit: input.limit };
}

// ─── Update ──────────────────────────────────────────────────

export async function changePassword(
  id: string,
  input: ChangePasswordInput,
): Promise<Identity> {
  const identity = await getIdentityById(id);
  if (!identity) throw new Error("Identity not found");

  const valid = await verifyPassword(input.currentPassword, identity.hash);
  if (!valid) throw new Error("Current password is incorrect");

  const { hash, salt } = await encryptPassword(input.newPassword);

  return prisma.identity.update({
    where: { id },
    data: { hash, salt, mustChangePassword: false },
  });
}

// Updates mutable fields on an existing identity.
// Throws P2002 if updated email collides within the same tenant.
// Throws P2025 if identity does not exist.
export async function updateIdentity(
  id: string,
  input: UpdateIdentityInput,
): Promise<Identity> {
  return prisma.identity.update({
    where: { id },
    data: {
      ...(input.email !== undefined && { email: input.email }),
      ...(input.hash !== undefined && { hash: input.hash }),
      ...(input.salt !== undefined && { salt: input.salt }),
      ...(input.failedLoginAttempts !== undefined && {
        failedLoginAttempts: input.failedLoginAttempts,
      }),
      ...(input.lockedUntil !== undefined && {
        lockedUntil: input.lockedUntil,
      }),
      ...(input.mustChangePassword !== undefined && {
        mustChangePassword: input.mustChangePassword,
      }),
      ...(input.status !== undefined && { status: input.status }),
    },
  });
}

// ─── Role assignment (many-to-many) ──────────────────────────

// Connects an existing Role to an existing Identity.
// Prisma manages the implicit join table.
// Throws P2025 if either identity or role does not exist.
// Connecting the same role twice is a no-op (Prisma deduplicates).
export async function assignRoleToIdentity(
  input: AssignRoleInput,
): Promise<Identity & { roles: Role[] }> {
  return prisma.identity.update({
    where: { id: input.identityId },
    data: {
      roles: { connect: { id: input.roleId } },
    },
    include: { roles: true },
  });
}

// Disconnects a Role from an Identity.
// No-op if the role was not assigned.
// Throws P2025 if the identity does not exist.
export async function removeRoleFromIdentity(
  input: AssignRoleInput,
): Promise<Identity & { roles: Role[] }> {
  return prisma.identity.update({
    where: { id: input.identityId },
    data: {
      roles: { disconnect: { id: input.roleId } },
    },
    include: { roles: true },
  });
}

// Replaces all assigned roles for an identity in one atomic write.
// Uses Prisma's set: [] which disconnects all current roles first,
// then connects the new set. Roles not in the new array are removed.
export async function setRolesForIdentity(
  identityId: string,
  roleIds: string[],
): Promise<Identity & { roles: Role[] }> {
  return prisma.identity.update({
    where: { id: identityId },
    data: {
      roles: { set: roleIds.map((id) => ({ id })) },
    },
    include: { roles: true },
  });
}

// ─── Soft delete ─────────────────────────────────────────────

// Soft-deletes an identity.
// @@index([deletedAt]) supports filtering deleted records out.
// Does NOT remove the implicit join table rows for roles —
// Prisma's implicit many-to-many does not cascade soft deletes.
export async function softDeleteIdentity(id: string): Promise<Identity> {
  return prisma.identity.update({
    where: { id },
    data: { deletedAt: new Date(), status: "INACTIVE" },
  });
}

// Restores a soft-deleted identity back to PENDING_VERIFICATION.
export async function restoreIdentity(id: string): Promise<Identity> {
  return prisma.identity.update({
    where: { id },
    data: { deletedAt: null, status: "PENDING_VERIFICATION" },
  });
}
