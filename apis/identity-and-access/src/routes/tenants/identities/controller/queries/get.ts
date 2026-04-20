import { getIdentityById } from "@r6/db-identity-and-access";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../../../../lib/errors";
import { resolveParam } from "../../../helpers";
import { toSafeIdentity } from "../../../identities/helpers";

// GET /tenants/:tenantId/identities/:id
// Fetches a single identity by ID, scoped to this tenant.
// Requires: iam:identity:read
export const getIdentityHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const tenantId = resolveParam(req, "tenantId");
    const id = resolveParam(req, "id");

    if (!tenantId || !id) {
      return next(
        new AppError(
          400,
          "validation_error",
          "Tenant ID and identity ID are required",
        ),
      );
    }

    const identity = await getIdentityById(id, tenantId);

    if (!identity) {
      return next(new AppError(404, "not_found", "Identity not found"));
    }

    res.status(200).json(toSafeIdentity(identity));
  } catch (err) {
    next(err);
  }
};
