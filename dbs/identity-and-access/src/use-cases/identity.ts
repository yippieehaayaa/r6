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
import { hmac } from "@r6/crypto";
import type {
  Identity,
  Policy,
  Prisma,
  Role,
} from "../../generated/prisma/client.js";
import { prisma } from "../client.js";
import { getTenantBySlug } from "./tenant.js";
import type {
  AssignRoleInput,
  ChangePasswordInput,
  CreateIdentityInput,
  ListIdentitiesInput,
  PaginatedResult,
  UpdateIdentityInput,
  VerifyIdentityInput,
} from "./types.js";

// ─── Create ──────────────────────────────────────────────────

// Inserts a new Identity row.
// Throws P2002 if [tenantId, username] or [tenantId, email] already exists.
// hash and salt must be pre-computed by the caller.
const createIdentity = async (
  input: CreateIdentityInput,
): Promise<Identity> => {
  const { hash, salt } = await encryptPassword(hmac(input.password));

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
};

// ─── Read ────────────────────────────────────────────────────

// Finds a non-deleted identity by primary key.
// Optional tenantId adds DB-level tenant scope enforcement.
const getIdentityById = async (
  id: string,
  tenantId?: string | null,
): Promise<Identity | null> => {
  return prisma.identity.findFirst({
    where: { id, deletedAt: null, ...(tenantId !== undefined && { tenantId }) },
  });
};

// Finds a non-deleted identity by [tenantId, username].
// Uses @@unique([tenantId, username]) index.
const getIdentityByUsername = async (
  tenantId: string | null,
  username: string,
): Promise<Identity | null> => {
  return prisma.identity.findFirst({
    where: { tenantId, username, deletedAt: null },
  });
};

// Finds a non-deleted identity by [tenantId, email].
// Uses @@unique([tenantId, email]) index.
const getIdentityByEmail = async (
  tenantId: string | null,
  email: string,
): Promise<Identity | null> => {
  return prisma.identity.findFirst({
    where: { tenantId, email, deletedAt: null },
  });
};

// Returns a non-deleted identity with its assigned roles included.
// Roles relation is many-to-many via implicit join table.
const getIdentityWithRoles = async (
  id: string,
): Promise<(Identity & { roles: Role[] }) | null> => {
  return prisma.identity.findFirst({
    where: { id, deletedAt: null },
    include: { roles: true },
  });
};

// Returns a non-deleted identity with roles and their attached policies.
// Used during auth flows to build token claims (role IDs + permission strings).
// Optional tenantId adds DB-level tenant scope enforcement.
const getIdentityWithRolesAndPolicies = async (
  id: string,
  tenantId?: string | null,
): Promise<
  (Identity & { roles: (Role & { policies: Policy[] })[] }) | null
> => {
  return prisma.identity.findFirst({
    where: { id, deletedAt: null, ...(tenantId !== undefined && { tenantId }) },
    include: { roles: { include: { policies: true } } },
  });
};

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
const listIdentities = async (
  input: ListIdentitiesInput,
): Promise<PaginatedResult<Identity>> => {
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
};

// ─── Update ──────────────────────────────────────────────────

const changePassword = async (
  id: string,
  input: ChangePasswordInput,
): Promise<Identity> => {
  const identity = await getIdentityById(id);
  if (!identity) throw new Error("Identity not found");

  const valid = await verifyPassword(
    hmac(input.currentPassword),
    identity.hash,
  );
  if (!valid) throw new Error("Current password is incorrect");

  const { hash, salt } = await encryptPassword(hmac(input.newPassword));

  return prisma.identity.update({
    where: { id },
    data: { hash, salt, mustChangePassword: false },
  });
};

// ─── Verify (login) ─────────────────────────────────────────

const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_LOCK_MS = 15 * 60 * 1000;

// Looks up an identity by username or email, verifies the HMAC-prefixed
// bcrypt hash, manages failed attempt counting and account locking,
// and returns the full identity with roles+policies on success.
const verifyIdentity = async (
  input: VerifyIdentityInput,
): Promise<Identity & { roles: (Role & { policies: Policy[] })[] }> => {
  // Resolve tenantSlug → tenantId. Unknown slug is reported as invalid_credentials
  // to avoid leaking whether a tenant exists.
  let tenantId = input.tenantId ?? null;
  if (tenantId === null && input.tenantSlug) {
    const tenant = await getTenantBySlug(input.tenantSlug);
    if (!tenant) throw new Error("invalid_credentials");
    tenantId = tenant.id;
  }

  const identity = await getIdentityByUsername(
    tenantId,
    input.username as string,
  );

  if (!identity) throw new Error("invalid_credentials");

  if (identity.lockedUntil && identity.lockedUntil > new Date())
    throw new Error(`account_locked:${identity.lockedUntil.toISOString()}`);

  if (identity.status !== "ACTIVE")
    throw new Error(`account_inactive:${identity.status}`);

  const valid = await verifyPassword(hmac(input.password), identity.hash);

  if (!valid) {
    const newAttempts = identity.failedLoginAttempts + 1;
    const lock = newAttempts >= LOGIN_MAX_ATTEMPTS;
    await updateIdentity(identity.id, {
      failedLoginAttempts: newAttempts,
      lockedUntil: lock ? new Date(Date.now() + LOGIN_LOCK_MS) : undefined,
    });
    throw new Error("invalid_credentials");
  }

  await updateIdentity(identity.id, {
    failedLoginAttempts: 0,
    lockedUntil: null,
  });

  const full = await getIdentityWithRolesAndPolicies(identity.id);
  if (!full) throw new Error("internal");
  return full;
};

// Updates mutable fields on an existing identity.
// Throws P2002 if updated email collides within the same tenant.
// Throws P2025 if identity does not exist.
const updateIdentity = async (
  id: string,
  input: UpdateIdentityInput,
): Promise<Identity> => {
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
};

// ─── Role assignment (many-to-many) ──────────────────────────

// Connects an existing Role to an existing Identity.
// Prisma manages the implicit join table.
// Throws P2025 if either identity or role does not exist.
// Connecting the same role twice is a no-op (Prisma deduplicates).
const assignRoleToIdentity = async (
  input: AssignRoleInput,
): Promise<Identity & { roles: Role[] }> => {
  return prisma.identity.update({
    where: { id: input.identityId },
    data: {
      roles: { connect: { id: input.roleId } },
    },
    include: { roles: true },
  });
};

// Disconnects a Role from an Identity.
// No-op if the role was not assigned.
// Throws P2025 if the identity does not exist.
const removeRoleFromIdentity = async (
  input: AssignRoleInput,
): Promise<Identity & { roles: Role[] }> => {
  return prisma.identity.update({
    where: { id: input.identityId },
    data: {
      roles: { disconnect: { id: input.roleId } },
    },
    include: { roles: true },
  });
};

// Replaces all assigned roles for an identity in one atomic write.
// Uses Prisma's set: [] which disconnects all current roles first,
// then connects the new set. Roles not in the new array are removed.
const setRolesForIdentity = async (
  identityId: string,
  roleIds: string[],
): Promise<Identity & { roles: Role[] }> => {
  return prisma.identity.update({
    where: { id: identityId },
    data: {
      roles: { set: roleIds.map((id) => ({ id })) },
    },
    include: { roles: true },
  });
};

// ─── Soft delete ─────────────────────────────────────────────

// Soft-deletes an identity.
// @@index([deletedAt]) supports filtering deleted records out.
// Does NOT remove the implicit join table rows for roles —
// Prisma's implicit many-to-many does not cascade soft deletes.
const softDeleteIdentity = async (id: string): Promise<Identity> => {
  return prisma.identity.update({
    where: { id },
    data: { deletedAt: new Date(), status: "INACTIVE" },
  });
};

// Restores a soft-deleted identity back to PENDING_VERIFICATION.
const restoreIdentity = async (id: string): Promise<Identity> => {
  return prisma.identity.update({
    where: { id },
    data: { deletedAt: null, status: "PENDING_VERIFICATION" },
  });
};

export {
  createIdentity,
  verifyIdentity,
  getIdentityById,
  getIdentityByUsername,
  getIdentityByEmail,
  getIdentityWithRoles,
  getIdentityWithRolesAndPolicies,
  listIdentities,
  changePassword,
  updateIdentity,
  assignRoleToIdentity,
  removeRoleFromIdentity,
  setRolesForIdentity,
  softDeleteIdentity,
  restoreIdentity,
};
