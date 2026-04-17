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
//    tenantId non-nullable           — all identities belong to a tenant
//    identityRoles IdentityRole[]    — explicit M2M join table
//    identityPermissions []          — per-user permission overrides
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
  IdentityRole,
  Policy,
  Prisma,
  Role,
  RolePolicy,
} from "../../generated/prisma/client.js";
import { prisma } from "../client.js";
import { LOGIN_LOCK_MS, LOGIN_MAX_ATTEMPTS } from "./constants.js";
import type { PaginatedResult } from "./shared.js";
import { buildPaginationQuery } from "./shared.js";
import { getTenantBySlug } from "./tenant.js";
import type {
  AssignRoleInput,
  ChangePasswordInput,
  CreateIdentityInput,
  ListIdentitiesInput,
  UpdateIdentityInput,
  VerifyIdentityInput,
} from "./types.js";

// ─── Shared return types ─────────────────────────────────────

export type IdentityWithRoles = Identity & {
  identityRoles: (IdentityRole & { role: Role })[];
};

// Used during auth to build JWT claims.
// identityPermissions provides the per-user ALLOW/DENY overrides.
// NOTE: identityPermissions relation requires `prisma migrate dev` first.
export type IdentityWithRolesAndPolicies = Identity & {
  identityRoles: (IdentityRole & {
    role: Role & { rolePolicies: (RolePolicy & { policy: Policy })[] };
  })[];
  // identityPermissions: IdentityPermission[]; // uncomment after migration
};

// ─── Create ──────────────────────────────────────────────────

// Inserts a new Identity row.
// Throws P2002 if [tenantId, username] or [tenantId, email] already exists.
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

// Finds a non-deleted identity by primary key within a tenant.
const getIdentityById = async (
  id: string,
  tenantId: string,
): Promise<Identity | null> => {
  return prisma.identity.findFirst({
    where: { id, tenantId, deletedAt: null },
  });
};

// Finds a non-deleted identity by [tenantId, username].
// Uses @@unique([tenantId, username]) index.
const getIdentityByUsername = async (
  tenantId: string,
  username: string,
): Promise<Identity | null> => {
  return prisma.identity.findFirst({
    where: { tenantId, username, deletedAt: null },
  });
};

// Finds a non-deleted identity by [tenantId, email].
// Uses @@unique([tenantId, email]) index.
const getIdentityByEmail = async (
  tenantId: string,
  email: string,
): Promise<Identity | null> => {
  return prisma.identity.findFirst({
    where: { tenantId, email, deletedAt: null },
  });
};

// Returns a non-deleted identity with its assigned roles included.
const getIdentityWithRoles = async (
  id: string,
  tenantId: string,
): Promise<IdentityWithRoles | null> => {
  return prisma.identity.findFirst({
    where: { id, tenantId, deletedAt: null },
    include: { identityRoles: { include: { role: true } } },
  });
};

// Returns a non-deleted identity with roles and their attached policies.
// Used during auth flows to build token claims (role names + permission strings).
// TODO: add identityPermissions include after `prisma migrate dev`.
const getIdentityWithRolesAndPolicies = async (
  id: string,
  tenantId: string,
): Promise<IdentityWithRolesAndPolicies | null> => {
  return prisma.identity.findFirst({
    where: { id, tenantId, deletedAt: null },
    include: {
      identityRoles: {
        include: {
          role: {
            include: { rolePolicies: { include: { policy: true } } },
          },
        },
      },
    },
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
  ...(input.search !== undefined &&
    input.search.length > 0 && {
      OR: [
        { username: { contains: input.search, mode: "insensitive" } },
        { email: { contains: input.search, mode: "insensitive" } },
      ],
    }),
});

// Returns a paginated list of identities for a tenant.
// status filter uses @@index([tenantId, status]).
// kind filter uses @@index([tenantId, kind]).
const listIdentities = async (
  input: ListIdentitiesInput,
): Promise<PaginatedResult<Identity>> => {
  const where = buildWhere(input);
  const { skip, take } = buildPaginationQuery(input);

  const [data, total] = await Promise.all([
    prisma.identity.findMany({
      where,
      skip,
      take,
      orderBy: { username: "asc" },
    }),
    prisma.identity.count({ where }),
  ]);

  return { data, total, page: input.page, limit: input.limit };
};

// ─── Update ──────────────────────────────────────────────────

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

const changePassword = async (
  id: string,
  tenantId: string,
  input: ChangePasswordInput,
): Promise<Identity> => {
  const identity = await getIdentityById(id, tenantId);
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

// Looks up an identity by username, verifies the HMAC-prefixed bcrypt hash,
// manages failed attempt counting and account locking, and returns the full
// identity with roles+policies on success.
//
// Tenant resolution: input.tenantId takes priority; falls back to tenantSlug.
// One of the two must be provided — there is no admin login path.
const verifyIdentity = async (
  input: VerifyIdentityInput,
): Promise<IdentityWithRolesAndPolicies> => {
  let tenantId: string;

  if (input.tenantId) {
    tenantId = input.tenantId;
  } else if (input.tenantSlug) {
    const tenant = await getTenantBySlug(input.tenantSlug);
    if (!tenant) throw new Error("invalid_credentials");
    if (!tenant.isActive || tenant.deletedAt)
      throw new Error("account_inactive:tenant_suspended");
    tenantId = tenant.id;
  } else {
    throw new Error("invalid_credentials");
  }

  const identity = await getIdentityByUsername(tenantId, input.username);

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

  const full = await getIdentityWithRolesAndPolicies(identity.id, tenantId);
  if (!full) throw new Error("internal");
  return full;
};

// ─── Role assignment (many-to-many) ──────────────────────────

// Inserts a row into the explicit _identity_roles join table.
// Throws P2002 if the same [identityId, roleId] already exists.
// Throws P2025 if either the identity or role does not exist.
const assignRoleToIdentity = async (
  input: AssignRoleInput,
): Promise<IdentityRole> => {
  return prisma.identityRole.create({
    data: { identityId: input.identityId, roleId: input.roleId },
  });
};

// Removes a row from the explicit _identity_roles join table.
// Throws P2025 if the [identityId, roleId] row does not exist.
const removeRoleFromIdentity = async (
  input: AssignRoleInput,
): Promise<IdentityRole> => {
  return prisma.identityRole.delete({
    where: {
      identityId_roleId: {
        identityId: input.identityId,
        roleId: input.roleId,
      },
    },
  });
};

// Replaces all assigned roles for an identity atomically.
const setRolesForIdentity = async (
  identityId: string,
  roleIds: string[],
): Promise<void> => {
  await prisma.$transaction([
    prisma.identityRole.deleteMany({ where: { identityId } }),
    prisma.identityRole.createMany({
      data: roleIds.map((roleId) => ({ identityId, roleId })),
      skipDuplicates: true,
    }),
  ]);
};

// ─── TOTP ────────────────────────────────────────────────────

// Persists an AES-256-GCM encrypted TOTP secret. totpEnabled stays false
// until the user confirms the first code via activateTotp.
const saveTotpSecret = async (
  id: string,
  encryptedSecret: string,
): Promise<void> => {
  await prisma.identity.update({
    where: { id },
    data: {
      totpSecret: encryptedSecret,
      totpEnabled: false,
      totpVerifiedAt: null,
    },
  });
};

// Marks TOTP as enabled after the identity verifies their first code.
const activateTotp = async (id: string): Promise<void> => {
  await prisma.identity.update({
    where: { id },
    data: { totpEnabled: true, totpVerifiedAt: new Date() },
  });
};

// Clears all TOTP data, returning the identity to single-factor auth.
const disableTotp = async (id: string): Promise<void> => {
  await prisma.identity.update({
    where: { id },
    data: { totpSecret: null, totpEnabled: false, totpVerifiedAt: null },
  });
};

// ─── Soft delete ─────────────────────────────────────────────

// Soft-deletes an identity. IdentityRole join rows are left intact.
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
  saveTotpSecret,
  activateTotp,
  disableTotp,
};
