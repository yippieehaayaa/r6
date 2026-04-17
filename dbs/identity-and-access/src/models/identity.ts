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
//    identityPermissions []          — per-user permission overrides (stamped from policies)
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
  IdentityPermission,
  Prisma,
} from "../../generated/prisma/client.js";
import { prisma } from "../client.js";
import { LOGIN_LOCK_MS, LOGIN_MAX_ATTEMPTS } from "./constants.js";
import type { PaginatedResult } from "./shared.js";
import { buildPaginationQuery } from "./shared.js";
import { getTenantBySlug } from "./tenant.js";
import type {
  ChangePasswordInput,
  CreateIdentityInput,
  ListIdentitiesInput,
  UpdateIdentityInput,
  VerifyIdentityInput,
} from "./types.js";

// ─── Shared return types ─────────────────────────────────────

// Used during auth to build JWT claims from direct permission overrides.
export type IdentityWithPermissions = Identity & {
  identityPermissions: IdentityPermission[];
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

// Returns a non-deleted identity with its direct permission overrides.
// Used during auth flows to build token claims (permission strings).
// No tenantId required — used in refresh flow where only identity id is known.
const getIdentityWithPermissions = async (
  id: string,
): Promise<IdentityWithPermissions | null> => {
  return prisma.identity.findFirst({
    where: { id, deletedAt: null },
    include: { identityPermissions: true },
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
// Verifies the identity belongs to tenantId before writing — prevents cross-tenant mutation.
// Throws P2002 if updated email collides within the same tenant.
const updateIdentity = async (
  id: string,
  tenantId: string,
  input: UpdateIdentityInput,
): Promise<Identity> => {
  const existing = await getIdentityById(id, tenantId);
  if (!existing) throw new Error("not_found");
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
// identity with permissions on success.
//
// Tenant resolution: input.tenantId takes priority; falls back to tenantSlug.
// One of the two must be provided — there is no admin login path.
const verifyIdentity = async (
  input: VerifyIdentityInput,
): Promise<IdentityWithPermissions> => {
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
    await updateIdentity(identity.id, tenantId, {
      failedLoginAttempts: newAttempts,
      lockedUntil: lock ? new Date(Date.now() + LOGIN_LOCK_MS) : undefined,
    });
    throw new Error("invalid_credentials");
  }

  await updateIdentity(identity.id, tenantId, {
    failedLoginAttempts: 0,
    lockedUntil: null,
  });

  const full = await getIdentityWithPermissions(identity.id);
  if (!full) throw new Error("internal");
  return full;
};

// ─── TOTP ────────────────────────────────────────────────────

// Persists an AES-256-GCM encrypted TOTP secret. totpEnabled stays false
// until the user confirms the first code via activateTotp.
const saveTotpSecret = async (
  id: string,
  tenantId: string,
  encryptedSecret: string,
): Promise<void> => {
  await prisma.identity.updateMany({
    where: { id, tenantId, deletedAt: null },
    data: {
      totpSecret: encryptedSecret,
      totpEnabled: false,
      totpVerifiedAt: null,
    },
  });
};

// Marks TOTP as enabled after the identity verifies their first code.
const activateTotp = async (id: string, tenantId: string): Promise<void> => {
  await prisma.identity.updateMany({
    where: { id, tenantId, deletedAt: null },
    data: { totpEnabled: true, totpVerifiedAt: new Date() },
  });
};

// Clears all TOTP data, returning the identity to single-factor auth.
const disableTotp = async (id: string, tenantId: string): Promise<void> => {
  await prisma.identity.updateMany({
    where: { id, tenantId, deletedAt: null },
    data: { totpSecret: null, totpEnabled: false, totpVerifiedAt: null },
  });
};

// ─── Soft delete ─────────────────────────────────────────────

// Soft-deletes an identity.
// Verifies the identity belongs to tenantId before writing.
const softDeleteIdentity = async (
  id: string,
  tenantId: string,
): Promise<Identity> => {
  const existing = await getIdentityById(id, tenantId);
  if (!existing) throw new Error("not_found");
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
  getIdentityWithPermissions,
  listIdentities,
  changePassword,
  updateIdentity,
  softDeleteIdentity,
  restoreIdentity,
  saveTotpSecret,
  activateTotp,
  disableTotp,
};
