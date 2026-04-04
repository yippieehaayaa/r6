import { attachPolicyToRole, getPolicyById } from "@r6/db-identity-and-access";
import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { AppError } from "../../../lib/errors";
import { ensurePolicyInModuleScope } from "../../policies/helpers";
import { ensureTenantExistsBySlug } from "../../tenants/helpers";
import { ensureRoleBelongsToTenant } from "../helpers";

const UuidSchema = z.string().uuid();

export async function attachPolicy(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tenantSlug = req.params.tenantSlug as string;
    const tenant = await ensureTenantExistsBySlug(tenantSlug);
    const id = req.params.id as string;
    await ensureRoleBelongsToTenant(id, tenant.id);
    const { policyId } = z.object({ policyId: UuidSchema }).parse(req.body);

    // Non-Admin callers may only attach policies that are fully within
    // their tenant's availed modules (strict subset rule).
    if (req.jwtPayload?.kind !== "ADMIN") {
      const policy = await getPolicyById(policyId);
      if (!policy) {
        throw new AppError(404, "not_found", "Policy not found");
      }
      ensurePolicyInModuleScope(policy, tenant.moduleAccess);
    }

    const result = await attachPolicyToRole({ roleId: id, policyId });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
