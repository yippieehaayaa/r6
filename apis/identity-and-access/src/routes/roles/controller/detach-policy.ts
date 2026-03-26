import { detachPolicyFromRole } from "@r6/db-identity-and-access";
import type { NextFunction, Request, Response } from "express";
import { ensureTenantExistsBySlug } from "../../tenants/helpers";
import { ensureRoleBelongsToTenant } from "../helpers";

export async function detachPolicy(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tenantSlug = req.params.tenantSlug as string;
    const tenant = await ensureTenantExistsBySlug(tenantSlug);
    const id = req.params.id as string;
    const policyId = req.params.policyId as string;
    await ensureRoleBelongsToTenant(id, tenant.id);
    const result = await detachPolicyFromRole({ roleId: id, policyId });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
