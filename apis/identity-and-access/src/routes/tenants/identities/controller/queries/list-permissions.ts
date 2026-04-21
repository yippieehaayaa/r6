import { getAllIdentityPermissions } from "@r6/db-identity-and-access";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../../../../lib/errors";
import { resolveParam } from "../../../helpers";

// GET /tenants/:tenantId/identities/:id/permissions
// Returns all permission grants for a single identity (no pagination).
// Requires: iam:identity:read
export const listIdentityPermissionsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const tenantId = resolveParam(req, "tenantId");
    const identityId = resolveParam(req, "id");

    if (!tenantId || !identityId) {
      return next(
        new AppError(
          400,
          "validation_error",
          "Tenant ID and identity ID are required",
        ),
      );
    }

    const permissions = await getAllIdentityPermissions(identityId, tenantId);

    res.status(200).json({ data: permissions });
  } catch (err) {
    next(err);
  }
};
