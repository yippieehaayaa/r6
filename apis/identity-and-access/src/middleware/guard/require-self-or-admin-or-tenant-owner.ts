import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../lib/errors";
import { checkPermission } from "../../lib/jwt";
import type { AuthJwtPayload } from "../auth";

// Allows:
//   - ADMIN (cross-tenant, no restriction)
//   - USER or SERVICE that holds the "tenant-owner" role within the
//     target tenant (tenantSlug match + role check)
//   - The identity whose primary key matches :id (acting on themselves)
//   - Optionally: any identity with a specific permission (orPermission)
//
// Used for per-identity read/update routes where a regular user may only
// operate on their own record, while admins and tenant owners can reach any.

interface Options {
  orPermission?: string;
}

export const requireSelfOrAdminOrTenantOwner =
  (options: Options = {}) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const payload = req.jwtPayload as AuthJwtPayload | undefined;

    if (!payload) {
      return next(new AppError(401, "unauthorized", "Authentication required"));
    }

    if (payload.kind === "ADMIN") return next();

    const permissions: string[] = Array.isArray(payload.permissions)
      ? payload.permissions
      : [];
    const tenantSlug = req.params.tenantSlug;

    if (
      checkPermission("iam:*:*", permissions) &&
      payload.tenantSlug === tenantSlug
    ) {
      return next();
    }

    if (payload.sub === req.params.id) return next();

    if (
      options.orPermission &&
      checkPermission(options.orPermission, payload.permissions ?? [])
    ) {
      return next();
    }

    return next(
      new AppError(
        403,
        "forbidden",
        "You can only perform this action on your own identity",
      ),
    );
  };
