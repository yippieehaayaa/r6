import type { NextFunction, Request, Response } from "express";
import { createRemoteJWKSet, errors as JoseErrors, jwtVerify } from "jose";
import { env } from "../../../config";
import { UnauthorizedError } from "../../errors";

// JWT payload shape as issued by identity-and-access.
export type AuthJwtPayload = {
  /** Identity primary key */
  sub?: string;
  /** IdentityKind: "ADMIN" | "USER" | "SERVICE" */
  kind?: string;
  /** null for ADMIN; slug string for USER/SERVICE */
  tenantSlug?: string | null;
  /** Role names */
  roles?: string[];
  /** Flattened permission strings, e.g. ["inventory:*:*", "catalog:*:*"] */
  permissions?: string[];
  /** JWT ID */
  jti?: string;
  /** Expiry (epoch seconds) */
  exp?: number;
  /** Issued-at (epoch seconds) */
  iat?: number;
};

// JWKS set is created once at module load and cached in memory.
// jose handles:
//   - lazy initial fetch on first token verification
//   - automatic key refresh when a new kid appears (key rotation)
//   - rate-limiting of JWKS re-fetches to prevent hammering IAM
// IAM does NOT need to be reachable at startup — only at first auth request.
// If IAM goes down after the first successful fetch, previously cached keys
// continue to work, so IAC auth is resilient to short IAM outages.
const JWKS = createRemoteJWKSet(
  new URL(`${env.IAM_INTERNAL_URL}/.well-known/jwks.json`),
);

// Verifies the Bearer token locally using RS256 cryptographic verification
// against IAM's public key.  Zero network hop per request — eliminates the
// per-request IAM dependency that remote introspection would introduce.
export const authMiddleware =
  () => async (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.header("Authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return next(new UnauthorizedError("Missing or invalid Authorization header"));
    }

    const token = authHeader.slice(7);

    try {
      const { payload } = await jwtVerify<AuthJwtPayload>(token, JWKS, {
        issuer: env.JWT_ISSUER,
        audience: env.JWT_AUDIENCE,
        algorithms: ["RS256"],
      });

      // Require jti — tokens without it cannot participate in the Redis
      // revocation denylist and must be rejected to fail closed.
      if (!payload.jti) {
        return next(new UnauthorizedError("Token missing required jti claim"));
      }

      req.jwtPayload = payload;
      return next();
    } catch (err) {
      if (err instanceof JoseErrors.JWTExpired) {
        return next(new UnauthorizedError("Token has expired"));
      }
      return next(new UnauthorizedError("Invalid or expired token"));
    }
  };
