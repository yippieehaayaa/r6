import { createRemoteJWKSet, type JWTPayload, jwtVerify } from "jose";
import { env } from "../config";

const JWKS = createRemoteJWKSet(
  new URL(`${env.IAM_INTERNAL_URL}/.well-known/jwks.json`),
);

export const verifyAccessToken = async (token: string): Promise<JWTPayload> => {
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
    algorithms: ["RS256"],
  });

  return payload;
};

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
