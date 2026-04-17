import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../lib/errors";
import { checkPermission } from "../../lib/jwt";
import type { AuthJwtPayload } from "../auth";

// Allows:
//   - ADMIN (cross-tenant, no tenantId restriction)
//   - USER or SERVICE that holds the "tenant-owner" role AND whose JWT
//     tenantId matches the target tenant id, resolved from (in order):
//       1. req.params.tenantId
//       2. req.params.id  (for routes like /tenants/:id)
//       3. req.body.tenantId
//
// Used for tenant management routes and bulk identity operations.
export const requireAdminOrTenantOwner =
  () => (req: Request, _res: Response, next: NextFunction) => {
    const payload = req.jwtPayload as AuthJwtPayload | undefined;

    if (!payload) {
      return next(new AppError(401, "unauthorized", "Authentication required"));
    }

    if (payload.kind === "ADMIN") return next();

    const targetTenantId: string | undefined =
      req.params.tenantId ?? req.params.id ?? req.body?.tenantId;

    if (!targetTenantId) {
      return next(
        new AppError(400, "bad_request", "Unable to determine target tenant"),
      );
    }

    const hasFullIamAccess = checkPermission(
      "iam:*:*",
      (payload.permissions as string[] | undefined) ?? [],
    );

    if (!hasFullIamAccess || payload.tenantId !== targetTenantId) {
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
