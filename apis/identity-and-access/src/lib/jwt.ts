import { randomUUID } from "node:crypto";
import {
  calculateJwkThumbprint,
  exportJWK,
  importPKCS8,
  importSPKI,
  type JWTPayload,
  jwtVerify,
  SignJWT,
} from "jose";
import { hmac } from "@r6/crypto";
import { env } from "../config";

let privateKey: CryptoKey | null = null;
let publicKey: CryptoKey | null = null;

const loadKeys = async (): Promise<void> => {
  if (privateKey && publicKey) return;
  [privateKey, publicKey] = await Promise.all([
    importPKCS8(env.JWT_PRIVATE_KEY, "RS256"),
    importSPKI(env.JWT_PUBLIC_KEY, "RS256"),
  ]);
};

// ─── Token payload ───────────────────────────────────────────
//
// kind and tenantSlug are signed into the token so guards can
// authorize requests without a DB round-trip.
//
// kind:
//   "ADMIN"   — platform super-admin, tenantSlug will be null
//   "USER"    — human user belonging to a tenant
//   "SERVICE" — machine/service account belonging to a tenant
//
// tenantSlug:
//   null for ADMIN identities.
//   URL-safe slug string for USER and SERVICE identities.

export type AccessTokenPayload = {
  /** Identity primary key (maps to JWT `sub`) */
  sub: string;
  /** IdentityKind: ADMIN | USER | SERVICE */
  kind: string;
  /** null for ADMIN identities; slug string for USER / SERVICE */
  tenantSlug: string | null;
  /** Role names assigned to this identity */
  roles: string[];
  /** Flattened permission strings from all attached policies */
  permissions: string[];
};

export const signAccessToken = async (
  payload: AccessTokenPayload,
): Promise<string> => {
  await loadKeys();

  // Randomise TTL between 5 and 15 minutes to reduce the
  // predictability of token expiry windows.
  const ttlMs = 300_000 + Math.floor(Math.random() * 600_000);
  const expiresAt = new Date(Date.now() + ttlMs);

  return new SignJWT({
    kind: payload.kind,
    tenantSlug: payload.tenantSlug,
    roles: payload.roles,
    permissions: payload.permissions,
  })
    .setProtectedHeader({ alg: "RS256" })
    .setSubject(payload.sub)
    .setJti(randomUUID())
    .setIssuer(env.JWT_ISSUER)
    .setAudience(env.JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(privateKey as CryptoKey);
};

export const verifyAccessToken = async (token: string): Promise<JWTPayload> => {
  await loadKeys();

  const { payload } = await jwtVerify(token, publicKey as CryptoKey, {
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
    algorithms: ["RS256"],
  });

  return payload;
};

export const signRefreshToken = async (
  sub: string,
): Promise<{ token: string; jti: string }> => {
  await loadKeys();

  const jti = randomUUID();
  const expiresAt = new Date(Date.now() + env.JWT_REFRESH_TTL_MS);

  const token = await new SignJWT({ tokenType: "refresh" })
    .setProtectedHeader({ alg: "RS256" })
    .setSubject(sub)
    .setJti(jti)
    .setIssuer(env.JWT_ISSUER)
    .setAudience(env.JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(privateKey as CryptoKey);

  return { token, jti };
};

export const verifyRefreshToken = async (
  token: string,
): Promise<JWTPayload> => {
  await loadKeys();

  const { payload } = await jwtVerify(token, publicKey as CryptoKey, {
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
    algorithms: ["RS256"],
  });

  return payload;
};

export const getPublicJwk = async () => {
  await loadKeys();

  const jwk = await exportJWK(publicKey as CryptoKey);
  const kid = await calculateJwkThumbprint(jwk);

  return { ...jwk, use: "sig", alg: "RS256", kid };
};

// Produces a stable HMAC fingerprint for the requesting device.
// Built from User-Agent + IP so a stolen token from a different
// network or browser will fail the device binding check on refresh.
export const generateDeviceFingerprint = (userAgent: string, ip: string): string =>
  hmac(`${userAgent}::${ip}`);

// Checks whether a required permission string is satisfied by the
// set of granted permission strings. Supports wildcard * segments.
// e.g. "inventory:stock:read" is satisfied by "inventory:*:*"
export const checkPermission = (
  required: string,
  granted: string[],
): boolean => {
  const r = required.split(":");
  if (r.length !== 3) return false;
  return granted.some((g) => {
    const parts = g.split(":");
    if (parts.length !== 3) return false;
    return parts.every((seg, i) => seg === "*" || seg === r[i]);
  });
};
