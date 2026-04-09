import type { NextFunction, Request, Response } from "express";
import { env } from "../../../config";
import { ForbiddenError, UnauthorizedError } from "../../errors";

// JWT payload shape as issued by identity-and-access.
// Defined locally so inventory-and-catalog has no dependency on jose.
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

// Validates the Bearer token by forwarding it to the identity-and-access
// service via the API Gateway.  No JWT crypto lives here — all signing and
// verification is owned by identity-and-access.
export const authMiddleware =
  () => async (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.header("Authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return next(new UnauthorizedError("Missing or invalid Authorization header"));
    }

    try {
      const response = await fetch(
        `${env.API_GATEWAY_URL}/identity-and-access/auth/validate`,
        {
          method: "POST",
          headers: {
            Authorization: authHeader,
          },
        },
      );

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as {
          error?: { code?: string; message?: string };
        };

        if (response.status === 401) {
          return next(new UnauthorizedError(body?.error?.message ?? "Unauthorized"));
        }

        return next(new ForbiddenError(body?.error?.message ?? "Forbidden"));
      }

      const { payload } = (await response.json()) as { payload: AuthJwtPayload };
      req.jwtPayload = payload;
      return next();
    } catch {
      return next(new UnauthorizedError("Authentication service unavailable"));
    }
  };
