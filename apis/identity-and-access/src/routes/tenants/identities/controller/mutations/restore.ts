import { restoreIdentity } from "@r6/db-identity-and-access";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../../../../lib/errors";
import { resolveParam } from "../../../helpers";
import { toSafeIdentity } from "../../../identities/helpers";

// POST /tenants/:tenantId/identities/:id/restore
// Restores a soft-deleted identity back to PENDING_VERIFICATION.
// No tier check — the tenant-scope guard on the router and the
// iam:identity:restore permission check on the route are sufficient.
// Requires: iam:identity:restore
export const restoreIdentityHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = resolveParam(req, "id");

    if (!id) {
      return next(
        new AppError(400, "validation_error", "Identity ID is required"),
      );
    }

    const restored = await restoreIdentity(id);

    res.status(200).json(toSafeIdentity(restored));
  } catch (err) {
    next(err);
  }
};
