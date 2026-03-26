import { getRoleWithPolicies } from "@r6/db-identity-and-access";
import type { NextFunction, Request, Response } from "express";
import { ensureTenantExistsBySlug } from "../../tenants/helpers";
import { ensureRoleBelongsToTenant } from "../helpers";

export async function getRole(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tenantSlug = req.params.tenantSlug as string;
    const tenant = await ensureTenantExistsBySlug(tenantSlug);
    const id = req.params.id as string;
    await ensureRoleBelongsToTenant(id, tenant.id);
    const role = await getRoleWithPolicies(id);
    res.status(200).json(role);
  } catch (error) {
    next(error);
  }
}
