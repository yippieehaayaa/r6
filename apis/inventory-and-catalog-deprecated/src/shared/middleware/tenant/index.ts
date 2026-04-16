import type { NextFunction, Request, Response } from "express";
import { ForbiddenError, UnauthorizedError } from "../../errors";
import type { AuthJwtPayload } from "../auth";

// Enforces that the requesting identity is scoped to a specific tenant.
//
// Rules:
//   - Unauthenticated requests (no jwtPayload) are rejected with 401.
//   - ADMIN identities (kind === "ADMIN") carry tenantSlug: null by design
//     and are allowed through — they operate platform-wide.
//   - All other identities (USER, SERVICE) MUST carry a non-empty tenantSlug.
//     Tokens without one are rejected with 403 to prevent cross-tenant access.
//
// All downstream service calls derive the tenant scope exclusively from
// req.jwtPayload.tenantSlug, so enforcing its presence here guarantees that
// no request can reach or mutate another tenant's data.
//
// Usage:
//   router.use("/catalog", authMiddleware(), requireTenantAccess(), catalogController);
export const requireTenantAccess =
  () => (req: Request, _res: Response, next: NextFunction) => {
    const payload = req.jwtPayload as AuthJwtPayload | undefined;

    if (!payload) {
      return next(new UnauthorizedError("Authentication required"));
    }

    // ADMIN tokens are platform-scoped; tenantSlug is intentionally null.
    if (payload.kind === "ADMIN") {
      return next();
    }

    if (!payload.tenantSlug || typeof payload.tenantSlug !== "string") {
      return next(
        new ForbiddenError(
          "Token is not scoped to a tenant — cross-tenant access is not permitted",
        ),
      );
    }

    return next();
  };
