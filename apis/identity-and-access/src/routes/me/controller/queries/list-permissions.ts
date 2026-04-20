import { listIdentityPermissions } from "@r6/db-identity-and-access";
import { ListIdentityPermissionsQuerySchema } from "@r6/schemas";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../../../lib/errors";
import type { AuthJwtPayload } from "../../../../middleware/auth";

// GET /me/permissions
// Returns a paginated list of IdentityPermission rows (granted permissions)
// for the authenticated identity.
// Requires the caller to belong to a tenant (tenantId non-null in JWT).
export const listPermissions = async (
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

    const parsed = ListIdentityPermissionsQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      return next(
        new AppError(
          400,
          "validation_error",
          "Invalid query parameters",
          parsed.error.flatten(),
        ),
      );
    }

    const { page, limit } = parsed.data;

    const result = await listIdentityPermissions({
      identityId,
      tenantId,
      page,
      limit,
    });

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
