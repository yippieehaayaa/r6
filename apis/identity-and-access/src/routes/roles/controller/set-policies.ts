import { setPoliciesForRole } from "@r6/db-identity-and-access";
import { AssignPoliciesToRoleSchema } from "@r6/schemas/identity-and-access";
import type { NextFunction, Request, Response } from "express";
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
    const result = await setPoliciesForRole(id, policyIds);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
