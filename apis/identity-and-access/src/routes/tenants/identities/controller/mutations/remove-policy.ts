import {
  deleteIdentityPermissionsByPermissions,
  getIdentityWithPermissions,
  getPolicyById,
  getTenantById,
  revokeAllRefreshTokensForIdentity,
} from "@r6/db-identity-and-access";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../../../../lib/errors";
import type { AuthJwtPayload } from "../../../../../middleware/auth";
import { resolveParam } from "../../../helpers";
import {
  assertCanMutate,
  assertPolicyBelongsToTenant,
  resolveCallerTier,
  resolveTargetTier,
} from "../../../identities/helpers";

// DELETE /tenants/:tenantId/identities/:id/roles/:roleId
// Removes a policy from an identity by deleting the IdentityPermission rows
// that were stamped from that policy's permissions[]. The route param name
// (:roleId) is treated as policyId for URL compatibility.
//
// Requires: iam:role:assign
export const removePolicyHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const payload = req.jwtPayload as AuthJwtPayload;
    const tenantId = resolveParam(req, "tenantId");
    const id = resolveParam(req, "id");
    const policyId = resolveParam(req, "roleId");

    if (!tenantId || !id || !policyId) {
      return next(
        new AppError(
          400,
          "validation_error",
          "Tenant ID, identity ID and policy ID are required",
        ),
      );
    }

    const [tenant, target, policy] = await Promise.all([
      getTenantById(tenantId),
      getIdentityWithPermissions(id),
      getPolicyById(policyId),
    ]);

    if (!tenant) {
      return next(new AppError(404, "not_found", "Tenant not found"));
    }

    if (!target || target.tenantId !== tenantId) {
      return next(new AppError(404, "not_found", "Identity not found"));
    }

    assertPolicyBelongsToTenant(policy, tenantId);

    const callerTier = resolveCallerTier(payload, tenant);
    const targetTier = resolveTargetTier(target, tenant);

    assertCanMutate(callerTier, targetTier, id, payload.sub ?? "");

    await deleteIdentityPermissionsByPermissions(
      id,
      tenantId,
      policy.permissions,
    );

    await revokeAllRefreshTokensForIdentity(id);

    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
