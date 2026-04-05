import {
  getPoliciesByIds,
  setPoliciesForRole,
} from "@r6/db-identity-and-access";
import { AssignPoliciesToRoleSchema } from "@r6/schemas/identity-and-access";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../../lib/errors";
import { ensurePolicyInModuleScope } from "../../policies/helpers";
import { ensureTenantExistsBySlug } from "../../tenants/helpers";
import { ensureRoleBelongsToTenant } from "../helpers";

export async function setPolicies(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tenantSlug = req.params.tenantSlug as string;
    const tenant = await ensureTenantExistsBySlug(tenantSlug);
    const id = req.params.id as string;
    await ensureRoleBelongsToTenant(id, tenant.id);
    const { policyIds } = AssignPoliciesToRoleSchema.parse(req.body);

    // Non-Admin callers may only assign policies that are fully within
    // their tenant's availed modules. All IDs are validated before any
    // DB write occurs — fail fast rather than partial assignment.
    if (req.jwtPayload?.kind !== "ADMIN") {
      const policies = await getPoliciesByIds(policyIds);

      // Surface missing IDs explicitly rather than silently ignoring them.
      if (policies.length !== policyIds.length) {
        throw new AppError(
          400,
          "bad_request",
          "One or more policy IDs were not found",
        );
      }

      for (const policy of policies) {
        ensurePolicyInModuleScope(policy, tenant.moduleAccess);
      }
    }

    const result = await setPoliciesForRole(id, policyIds);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
