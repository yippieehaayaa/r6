import { getAllIdentityPermissions } from "@r6/db-identity-and-access";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../../../lib/errors";
import type { AuthJwtPayload } from "../../../../middleware/auth";

// GET /me/permissions/all
// Returns all IdentityPermission rows (granted permissions) for the
// authenticated identity — no pagination.
// Requires the caller to belong to a tenant (tenantId non-null in JWT).
export const getAllPermissions = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const payload = req.jwtPayload as AuthJwtPayload;
    const identityId = payload.sub;
    const tenantId = payload.tenantId ?? null;

    if (!identityId) {
      return next(new AppError(401, "unauthorized", "Authentication required"));
    }

    if (!tenantId) {
      return next(
        new AppError(
          400,
          "no_tenant",
          "You must belong to a tenant to view permissions",
        ),
      );
    }

    const data = await getAllIdentityPermissions(identityId, tenantId);

    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};
