import {
  getIdentityWithPermissions,
  getTenantById,
  updateIdentity,
} from "@r6/db-identity-and-access";
import { UpdateIdentitySchema } from "@r6/schemas";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../../../../lib/errors";
import type { AuthJwtPayload } from "../../../../../middleware/auth";
import { resolveParam } from "../../../helpers";
import {
  assertCanMutate,
  resolveCallerTier,
  resolveTargetTier,
  toSafeIdentity,
} from "../../../identities/helpers";

// PATCH /tenants/:tenantId/identities/:id
// Updates mutable profile fields on an identity within this tenant.
// Enforces tier-based write protection: callers may only update identities
// at a lower tier than themselves.
// Requires: iam:identity:update
export const updateIdentityHandler = async (
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

    const parsed = UpdateIdentitySchema.safeParse(req.body);

    if (!parsed.success) {
      return next(
        new AppError(
          400,
          "validation_error",
          "Invalid request body",
          parsed.error.flatten(),
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

    const updated = await updateIdentity(id, tenantId, parsed.data);

    res.status(200).json(toSafeIdentity(updated));
  } catch (err) {
    next(err);
  }
};
