import { randomUUID } from "node:crypto";
import { hmac } from "@r6/crypto";
import { type Prisma, prisma, type TokenKind } from "../client.js";
import {
  IdentityNotFoundError,
  SessionExpiredError,
  SessionNotFoundError,
  SessionRevokedError,
} from "../errors.js";

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const SESSION_PUBLIC_SELECT = {
  id: true,
  kind: true,
  audience: true,
  family: true,
  ipAddress: true,
  userAgent: true,
  createdAt: true,
  expiresAt: true,
  revokedAt: true,
  identityId: true,
} satisfies Prisma.RefreshTokenSelect;

const toTokenHash = (raw: string): string => hmac(raw.trim());

export type CreateSessionInput = {
  token: string;
  identityId: string;
  audience: string[];
  ipAddress?: string;
  userAgent?: string;
  kind?: TokenKind;
  ttlMs?: number;
};

export type RotateSessionInput = {
  token: string;
  ipAddress?: string;
  userAgent?: string;
};

const createSession = async (input: CreateSessionInput) => {
  const identity = await prisma.identity.findUnique({
    where: { id: input.identityId, deletedAt: null },
  });

  if (!identity) throw new IdentityNotFoundError();

  const ttl = input.ttlMs ?? REFRESH_TOKEN_TTL_MS;

  return await prisma.refreshToken.create({
    data: {
      token: toTokenHash(input.token),
      family: randomUUID(),
      audience: input.audience,
      kind: input.kind,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      expiresAt: new Date(Date.now() + ttl),
      identityId: input.identityId,
    },
    select: SESSION_PUBLIC_SELECT,
  });
};

const getValidSession = async (token: string) => {
  const session = await prisma.refreshToken.findUnique({
    where: { token: toTokenHash(token) },
    select: SESSION_PUBLIC_SELECT,
  });

  if (!session) throw new SessionNotFoundError();
  if (session.revokedAt) throw new SessionRevokedError();
  if (session.expiresAt < new Date()) throw new SessionExpiredError();

  return session;
};

const rotateSession = async (oldToken: string, input: RotateSessionInput) => {
  return await prisma.$transaction(async (tx) => {
    const session = await tx.refreshToken.findUnique({
      where: { token: toTokenHash(oldToken) },
      select: SESSION_PUBLIC_SELECT,
    });

    if (!session) throw new SessionNotFoundError();

    if (session.revokedAt) {
      await tx.refreshToken.updateMany({
        where: { family: session.family, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throw new SessionRevokedError();
    }

    if (session.expiresAt < new Date()) throw new SessionExpiredError();

    const originalTtl =
      session.expiresAt.getTime() - session.createdAt.getTime();

    const [newSession] = await Promise.all([
      tx.refreshToken.create({
        data: {
          token: toTokenHash(input.token),
          family: session.family,
          audience: session.audience,
          kind: session.kind,
          ipAddress: input?.ipAddress,
          userAgent: input?.userAgent,
          expiresAt: new Date(Date.now() + originalTtl),
          identityId: session.identityId,
        },
        select: SESSION_PUBLIC_SELECT,
      }),
      tx.refreshToken.updateMany({
        where: {
          family: session.family,
          revokedAt: null,
          token: { not: toTokenHash(input.token) },
        },
        data: { revokedAt: new Date() },
      }),
    ]);

    return newSession;
  });
};

const revokeSession = async (token: string) => {
  const result = await prisma.refreshToken.updateMany({
    where: { token: toTokenHash(token), revokedAt: null },
    data: { revokedAt: new Date() },
  });

  if (result.count === 0) throw new SessionNotFoundError();
};

const revokeAllSessions = async (identityId: string) => {
  return await prisma.refreshToken.updateMany({
    where: { identityId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
};

const revokeSessionFamily = async (family: string) => {
  return await prisma.refreshToken.updateMany({
    where: { family, revokedAt: null },
    data: { revokedAt: new Date() },
  });
};

const cleanupExpiredSessions = async () => {
  return await prisma.refreshToken.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
};

export { SESSION_PUBLIC_SELECT };

export default {
  createSession,
  getValidSession,
  rotateSession,
  revokeSession,
  revokeAllSessions,
  revokeSessionFamily,
  cleanupExpiredSessions,
} as const;
