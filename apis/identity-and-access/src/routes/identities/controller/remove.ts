import { softDeleteIdentity } from "@r6/db-identity-and-access";
import type { NextFunction, Request, Response } from "express";
import { ensureTenantExistsBySlug } from "../../tenants/helpers";
import { ensureIdentityBelongsToTenant } from "../helpers";

export async function remove(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tenantSlug = req.params.tenantSlug as string;
    const tenant = await ensureTenantExistsBySlug(tenantSlug);
    const id = req.params.id as string;
    await ensureIdentityBelongsToTenant(id, tenant.id);
    await softDeleteIdentity(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
