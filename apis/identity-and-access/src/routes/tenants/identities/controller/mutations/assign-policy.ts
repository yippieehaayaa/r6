import {
  createManyIdentityPermissions,
  getIdentityWithPermissions,
  getPolicyById,
  getTenantById,
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

const AssignPolicyBodySchema = z.object({
  policyId: UuidSchema,
});

// POST /tenants/:tenantId/identities/:id/roles
// Assigns a policy to an identity by stamping its permissions[] as
// IdentityPermission ALLOW rows. The route param name (:roles) is kept
// for URL compatibility — the operation is policy-based.
//
// Escalation guard: only the tenant OWNER may assign policies that
// contain the iam:*:* wildcard (admin-elevation policies).
//
// Requires: iam:role:assign
export const assignPolicyHandler = async (
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

    const parsed = AssignPolicyBodySchema.safeParse(req.body);

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

    const { policyId } = parsed.data;

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

    // Escalation guard — only OWNER may grant admin-elevation permissions.
    const grantsAdminAccess = policy.permissions.includes("iam:*:*");
    if (grantsAdminAccess && callerTier !== IdentityTier.OWNER) {
      return next(
        new AppError(
          403,
          "forbidden",
          "Only the tenant owner may assign admin-level policies.",
        ),
      );
    }

    await createManyIdentityPermissions(
      policy.permissions.map((permission) => ({
        identityId: id,
        tenantId,
        permission,
        effect: "ALLOW" as const,
      })),
    );

    res.status(200).json({ message: "Policy assigned successfully" });
  } catch (err) {
    next(err);
  }
};
