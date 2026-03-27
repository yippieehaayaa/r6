import type { NextFunction, Request, Response } from "express";
import { ensureTenantExistsBySlug } from "../../tenants/helpers";
import { ensurePolicyBelongsToTenant } from "../helpers";

export async function getPolicy(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tenantSlug = req.params.tenantSlug as string;
    const tenant = await ensureTenantExistsBySlug(tenantSlug);
    const id = req.params.id as string;
    const policy = await ensurePolicyBelongsToTenant(id, tenant.id);
    res.status(200).json(policy);
  } catch (error) {
    next(error);
  }
}
