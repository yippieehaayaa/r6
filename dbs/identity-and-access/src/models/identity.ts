// ============================================================
//  identity.ts
//  Use cases for the Identity model.
//
//  Constraints enforced here (from schema):
//    @unique username                 — username globally unique
//    @unique email                    — email globally unique
//    @@index([tenantId])
//    @@index([tenantId, status])
//    @@index([tenantId, kind])
//    @@index([deletedAt])
//    tenantId nullable               — null for unaffiliated users (registered, no tenant yet)
//    status default PENDING_VERIFICATION — transitions to ACTIVE on email verification
//    identityPermissions []          — per-user permission overrides (stamped from policies)
//    mustChangePassword default false
//    failedLoginAttempts default 0
//    status default PENDING_VERIFICATION
//    kind default USER               — all human users are USER; tier (owner/admin/user) is
//                                      determined by stamped permissions, not by kind
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
import { revokeAllRefreshTokensForIdentity } from "./session.js";
import type { PaginatedResult } from "./shared.js";
import { buildPaginationQuery } from "./shared.js";
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
// Throws P2002 if username or email already exists globally.
const createIdentity = async (
  input: CreateIdentityInput,
): Promise<Identity> => {
  const { hash, salt } = await encryptPassword(hmac(input.password));

  return prisma.identity.create({
    data: {
      tenantId: input.tenantId ?? null,
      firstName: input.firstName,
      middleName: input.middleName ?? null,
      lastName: input.lastName,
      country: input.country,
      username: input.username,
      email: input.email,
      hash,
      salt,
      kind: input.kind ?? "USER",
      mustChangePassword: input.mustChangePassword ?? false,
    },
  });
};

// ─── Read ────────────────────────────────────────────────────

// Finds a non-deleted identity by primary key.
// When tenantId is provided, also filters by tenantId (tenant-scope check).
// When tenantId is undefined, only filters by id (internal/admin use).
const getIdentityById = async (
  id: string,
  tenantId?: string | null,
): Promise<Identity | null> => {
  return prisma.identity.findFirst({
    where: { id, ...(tenantId !== undefined && { tenantId }), deletedAt: null },
  });
};

// Finds a non-deleted identity by username.
// Uses @unique username index.
const getIdentityByUsername = async (
  username: string,
): Promise<Identity | null> => {
  return prisma.identity.findFirst({
    where: { username, deletedAt: null },
  });
};

// Finds a non-deleted identity by email.
// Uses @unique email index.
const getIdentityByEmail = async (email: string): Promise<Identity | null> => {
  return prisma.identity.findFirst({
    where: { email, deletedAt: null },
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
// When tenantId is provided, verifies the identity belongs to that tenant first
// — prevents cross-tenant mutation. Pass undefined to skip the tenant scope check.
// Throws P2002 if updated email collides globally.
const updateIdentity = async (
  id: string,
  tenantId: string | null | undefined,
  input: UpdateIdentityInput,
): Promise<Identity> => {
  const existing = await getIdentityById(id, tenantId);
  if (!existing) throw new Error("not_found");
  return prisma.identity.update({
    where: { id },
    data: {
      ...(input.tenantId !== undefined && { tenantId: input.tenantId }),
      ...(input.firstName !== undefined && { firstName: input.firstName }),
      ...(input.middleName !== undefined && { middleName: input.middleName }),
      ...(input.lastName !== undefined && { lastName: input.lastName }),
      ...(input.country !== undefined && { country: input.country }),
      ...(input.email !== undefined && { email: input.email }),
      ...(input.isEmailVerified !== undefined && {
        isEmailVerified: input.isEmailVerified,
      }),
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
  tenantId: string | null | undefined,
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

  const updated = await prisma.identity.update({
    where: { id },
    data: { hash, salt, mustChangePassword: false },
  });

  await revokeAllRefreshTokensForIdentity(id);

  return updated;
};

// ─── Verify (login) ─────────────────────────────────────────

// Looks up an identity by username, verifies the HMAC-prefixed bcrypt hash,
// manages failed attempt counting and account locking, and returns the full
// identity with permissions on success.
//
// Username is globally unique — no tenant context needed for lookup.
const verifyIdentity = async (
  input: VerifyIdentityInput,
): Promise<IdentityWithPermissions> => {
  const identity = await getIdentityByUsername(input.username);

  if (!identity) throw new Error("invalid_credentials");

  if (identity.lockedUntil && identity.lockedUntil > new Date())
    throw new Error(`account_locked:${identity.lockedUntil.toISOString()}`);

  if (!identity.isEmailVerified) throw new Error("email_not_verified");

  if (identity.status !== "ACTIVE")
    throw new Error(`account_inactive:${identity.status}`);

  const valid = await verifyPassword(hmac(input.password), identity.hash);

  if (!valid) {
    const newAttempts = identity.failedLoginAttempts + 1;
    const lock = newAttempts >= LOGIN_MAX_ATTEMPTS;
    await updateIdentity(identity.id, identity.tenantId, {
      failedLoginAttempts: newAttempts,
      lockedUntil: lock ? new Date(Date.now() + LOGIN_LOCK_MS) : undefined,
    });
    throw new Error("invalid_credentials");
  }

  await updateIdentity(identity.id, identity.tenantId, {
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
  tenantId: string | null | undefined,
  encryptedSecret: string,
): Promise<void> => {
  await prisma.identity.updateMany({
    where: { id, ...(tenantId !== undefined && { tenantId }), deletedAt: null },
    data: {
      totpSecret: encryptedSecret,
      totpEnabled: false,
      totpVerifiedAt: null,
    },
  });
};

// Marks TOTP as enabled after the identity verifies their first code.
const activateTotp = async (
  id: string,
  tenantId: string | null | undefined,
): Promise<void> => {
  await prisma.identity.updateMany({
    where: { id, ...(tenantId !== undefined && { tenantId }), deletedAt: null },
    data: { totpEnabled: true, totpVerifiedAt: new Date() },
  });
};

// Clears all TOTP data, returning the identity to single-factor auth.
const disableTotp = async (
  id: string,
  tenantId: string | null | undefined,
): Promise<void> => {
  await prisma.identity.updateMany({
    where: { id, ...(tenantId !== undefined && { tenantId }), deletedAt: null },
    data: { totpSecret: null, totpEnabled: false, totpVerifiedAt: null },
  });
};

// ─── Soft delete ─────────────────────────────────────────────

// Soft-deletes an identity.
// When tenantId is provided, verifies the identity belongs to that tenant first.
const softDeleteIdentity = async (
  id: string,
  tenantId: string | null | undefined,
): Promise<Identity> => {
  const existing = await getIdentityById(id, tenantId);
  if (!existing) throw new Error("not_found");
  return prisma.identity.update({
    where: { id },
    data: { deletedAt: new Date(), status: "INACTIVE" },
  });
};

// Marks an identity as email-verified and activates it.
// Called after the user submits the correct OTP from the verification email.
const verifyEmail = async (identityId: string): Promise<Identity> => {
  return prisma.identity.update({
    where: { id: identityId },
    data: {
      isEmailVerified: true,
      status: "ACTIVE",
    },
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
  verifyEmail,
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
