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
//   "ADMIN"   — platform super-admin, tenantId will be null
//   "USER"    — human user belonging to a tenant
//   "SERVICE" — machine/service account belonging to a tenant
//
// tenantId:
//   null for ADMIN identities.
//   UUID string for USER and SERVICE identities.

export type AccessTokenPayload = {
  /** Identity primary key (maps to JWT `sub`) */
  sub: string;
  /** IdentityKind: ADMIN | USER | SERVICE */
  kind: string;
  /** null for ADMIN identities; UUID for USER / SERVICE */
  tenantId: string | null;
  /** Role IDs assigned to this identity */
  roles: string[];
  /** Flattened permission strings from all attached policies */
  permissions: string[];
};

export const signAccessToken = async (
  payload: AccessTokenPayload,
): Promise<string> => {
  await loadKeys();

  const expiresAt = new Date(Date.now() + Number(env.JWT_ACCESS_TTL_MS));

  return new SignJWT({
    kind: payload.kind,
    tenantId: payload.tenantId,
    roles: payload.roles,
    permissions: payload.permissions,
  })
    .setProtectedHeader({ alg: "RS256" })
    .setSubject(payload.sub)
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

export const signRefreshToken = async (sub: string): Promise<string> => {
  await loadKeys();

  const expiresAt = new Date(Date.now() + Number(env.JWT_REFRESH_TTL_MS));

  return new SignJWT({ tokenType: "refresh" })
    .setProtectedHeader({ alg: "RS256" })
    .setSubject(sub)
    .setIssuer(env.JWT_ISSUER)
    .setAudience(env.JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(privateKey as CryptoKey);
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
