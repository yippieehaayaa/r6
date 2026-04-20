import { createHmac, randomUUID } from "node:crypto";
import {
  calculateJwkThumbprint,
  exportJWK,
  importPKCS8,
  importSPKI,
  type JWTPayload,
  jwtVerify,
  SignJWT,
} from "jose";
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
// kind and tenantId are signed into the token so guards can
// authorize requests without a DB round-trip.
//
// kind:
//   "USER"    — human user belonging to a tenant (owner, admin, or regular
//               user — distinguished by the permissions array)
//   "SERVICE" — machine/service account belonging to a tenant
//
// tenantId:
//   UUID primary key of the Tenant record.
//   Downstream microservices (Inventory, Procurement, etc.) use this
//   directly — no slug-to-UUID resolution needed.

export type AccessTokenPayload = {
  /** Identity primary key (maps to JWT `sub`) */
  sub: string;
  /** IdentityKind: USER | SERVICE */
  kind: string;
  /** Tenant UUID for USER / SERVICE */
  tenantId: string | null;
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
    tenantId: payload.tenantId,
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

// ─── TOTP challenge token ────────────────────────────────────
//
// A short-lived RS256 JWT issued after a successful password check when the
// identity has TOTP enabled.  The client must exchange this token plus a
// valid TOTP code at POST /auth/totp/verify to obtain full access/refresh tokens.
// It carries tokenType: "totp_challenge" so it cannot be used as an access or
// refresh token.

export const signTotpChallengeToken = async (sub: string): Promise<string> => {
  await loadKeys();

  const expiresAt = new Date(Date.now() + env.JWT_TOTP_CHALLENGE_TTL_MS);

  return new SignJWT({ tokenType: "totp_challenge" })
    .setProtectedHeader({ alg: "RS256" })
    .setSubject(sub)
    .setJti(randomUUID())
    .setIssuer(env.JWT_ISSUER)
    .setAudience(env.JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(privateKey as CryptoKey);
};

export const verifyTotpChallengeToken = async (
  token: string,
): Promise<{ sub: string }> => {
  await loadKeys();

  const { payload } = await jwtVerify(token, publicKey as CryptoKey, {
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
    algorithms: ["RS256"],
  });

  if (
    payload.tokenType !== "totp_challenge" ||
    typeof payload.sub !== "string"
  ) {
    throw new Error("invalid_token_type");
  }

  return { sub: payload.sub };
};

// Produces a stable HMAC fingerprint for the requesting device.
// Built from User-Agent + IP so a stolen token from a different
// network or browser will fail the device binding check on refresh.
export const generateDeviceFingerprint = (
  userAgent: string,
  ip: string,
): string =>
  createHmac("sha256", env.DEVICE_FINGERPRINT_SECRET)
    .update(`${userAgent}::${ip}`)
    .digest("hex");

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
