import {
  getIdentityWithPermissions,
  getTenantById,
  softDeleteIdentity,
} from "@r6/db-identity-and-access";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../../../../lib/errors";
import type { AuthJwtPayload } from "../../../../../middleware/auth";
import { resolveParam } from "../../../helpers";
import {
  assertCanMutate,
  resolveCallerTier,
  resolveTargetTier,
} from "../../../identities/helpers";

// DELETE /tenants/:tenantId/identities/:id
// Soft-deletes an identity within this tenant.
// Enforces tier-based write protection.
// Requires: iam:identity:delete
export const removeIdentityHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const payload = req.jwtPayload as AuthJwtPayload;
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

    const [tenant, target] = await Promise.all([
      getTenantById(tenantId),
      getIdentityWithPermissions(id),
    ]);

    if (!tenant) {
      return next(new AppError(404, "not_found", "Tenant not found"));
    }

    if (!target || target.tenantId !== tenantId) {
      return next(new AppError(404, "not_found", "Identity not found"));
    }

    const callerTier = resolveCallerTier(payload, tenant);
    const targetTier = resolveTargetTier(target, tenant);

    assertCanMutate(callerTier, targetTier, id, payload.sub ?? "");

    await softDeleteIdentity(id, tenantId);

    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
