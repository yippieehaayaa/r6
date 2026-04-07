import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../lib/errors";
import type { AuthJwtPayload } from "../auth";

// Allows:
//   - ADMIN (cross-tenant, no tenantSlug restriction)
//   - USER or SERVICE that holds the "tenant-owner" role AND whose JWT
//     tenantSlug matches the target tenant slug, resolved from (in order):
//       1. req.params.tenantSlug
//       2. req.params.id  (for routes like /tenants/:id)
//       3. req.body.tenantSlug
//
// Used for tenant management routes and bulk identity operations.
export const requireAdminOrTenantOwner =
  () => (req: Request, _res: Response, next: NextFunction) => {
    const payload = req.jwtPayload as AuthJwtPayload | undefined;

    if (!payload) {
      return next(new AppError(401, "unauthorized", "Authentication required"));
    }

    if (payload.kind === "ADMIN") return next();

    const targetTenantSlug: string | undefined =
      req.params.tenantSlug ?? req.params.id ?? req.body?.tenantSlug;

    if (!targetTenantSlug) {
      return next(
        new AppError(400, "bad_request", "Unable to determine target tenant"),
      );
    }

    const roles: string[] = Array.isArray(payload.roles) ? payload.roles : [];

    if (
      !roles.includes("tenant-owner") ||
      payload.tenantSlug !== targetTenantSlug
    ) {
      return next(
        new AppError(
          403,
          "forbidden",
          "You do not have owner access to this tenant",
        ),
      );
    }

    return next();
  };
