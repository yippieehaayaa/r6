// ============================================================
//  session.ts
//  Use cases for the RefreshToken model.
//
//  Constraints enforced here:
//    jti @id               — one row per token; no duplicates
//    identityId @db.Uuid   — FK to Identity.id
//    revokedAt nullable    — null = active, set = revoked
//    expiresAt             — checked at query time by callers
//                            (JWT signature expiry is the
//                            primary guard; this is the DB record)
//
//  Token rotation:
//    On every successful refresh, the caller must:
//      1. revokeRefreshToken(oldJti)
//      2. createRefreshToken({ ...newFields })
//    This ensures each token is single-use.
//
//  Bulk revocation:
//    revokeAllRefreshTokensForIdentity is called when an
//    identity is suspended, deleted, or has their password
//    changed — forcing all active sessions to end.
// ============================================================

import type { RefreshToken } from "../../generated/prisma/client.js";
import { prisma } from "../client.js";

export type CreateRefreshTokenInput = {
  jti: string;
  identityId: string;
  deviceFingerprint: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
};

// ─── Create ──────────────────────────────────────────────────

export const createRefreshToken = async (
  input: CreateRefreshTokenInput,
): Promise<RefreshToken> => {
  return prisma.refreshToken.create({
    data: {
      jti: input.jti,
      identityId: input.identityId,
      deviceFingerprint: input.deviceFingerprint,
      userAgent: input.userAgent,
      ipAddress: input.ipAddress,
      expiresAt: input.expiresAt,
    },
  });
};

// ─── Read ─────────────────────────────────────────────────────

export const getRefreshToken = async (
  jti: string,
): Promise<RefreshToken | null> => {
  return prisma.refreshToken.findUnique({ where: { jti } });
};

// ─── Revoke (single) ─────────────────────────────────────────

export const revokeRefreshToken = async (jti: string): Promise<void> => {
  await prisma.refreshToken.update({
    where: { jti },
    data: { revokedAt: new Date() },
  });
};

// ─── List (active for identity) ──────────────────────────────

// Returns all non-revoked, non-expired sessions for the given identity.
// Ordered newest-first so callers can display the most recent session at the top.
export const listActiveSessionsForIdentity = async (
  identityId: string,
): Promise<RefreshToken[]> => {
  return prisma.refreshToken.findMany({
    where: {
      identityId,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });
};

// ─── Revoke (all for identity) ───────────────────────────────

// Used when an identity is suspended, deleted, or changes
// their password — invalidates every active session at once.
export const revokeAllRefreshTokensForIdentity = async (
  identityId: string,
): Promise<void> => {
  await prisma.refreshToken.updateMany({
    where: { identityId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
};
