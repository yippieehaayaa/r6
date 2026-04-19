import {
  deleteAllIdentityPermissions,
  getIdentityWithPermissions,
  getPoliciesByIds,
  getTenantById,
  setPoliciesForIdentity,
} from "@r6/db-identity-and-access";
import { UuidSchema } from "@r6/schemas";
import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { AppError } from "../../../../../lib/errors";
import type { AuthJwtPayload } from "../../../../../middleware/auth";
import { resolveParam } from "../../../helpers";
import { IdentityTier } from "../../../identities/constants";
import {
  assertCanMutate,
  assertPolicyBelongsToTenant,
  resolveCallerTier,
  resolveTargetTier,
} from "../../../identities/helpers";

const SetPoliciesBodySchema = z.object({
  policyIds: z.array(UuidSchema),
});

// PUT /tenants/:tenantId/identities/:id/roles
// Atomically replaces ALL IdentityPermission rows for an identity with the
// permissions derived from the provided policyIds. An empty policyIds array
// clears all permissions.
//
// Escalation guard: only the tenant OWNER may set policies that include
// the iam:*:* wildcard (admin-elevation policies).
//
// Requires: iam:role:assign
export const setPoliciesHandler = async (
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

    const parsed = SetPoliciesBodySchema.safeParse(req.body);

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

    const { policyIds } = parsed.data;

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

    // Empty policyIds — clear all permissions without fetching any policies.
    if (policyIds.length === 0) {
      await deleteAllIdentityPermissions(id, tenantId);
      res.status(200).json({ message: "All permissions cleared" });
      return;
    }

    const policies = await getPoliciesByIds(policyIds);

    // Verify every requested policy exists and belongs to this tenant.
    for (const policyId of policyIds) {
      const policy = policies.find((p) => p.id === policyId) ?? null;
      assertPolicyBelongsToTenant(policy, tenantId);
    }

    // Collect unique permissions across all policies.
    const allPermissions = [...new Set(policies.flatMap((p) => p.permissions))];

    // Escalation guard — only OWNER may set admin-elevation permissions.
    const grantsAdminAccess = allPermissions.includes("iam:*:*");
    if (grantsAdminAccess && callerTier !== IdentityTier.OWNER) {
      return next(
        new AppError(
          403,
          "forbidden",
          "Only the tenant owner may assign admin-level policies.",
        ),
      );
    }

    await setPoliciesForIdentity(id, tenantId, allPermissions);

    res.status(200).json({ message: "Policies set successfully" });
  } catch (err) {
    next(err);
  }
};
