import { restoreIdentity } from "@r6/db-identity-and-access";
import type { NextFunction, Request, Response } from "express";
import { ensureTenantExistsBySlug } from "../../tenants/helpers";
import { ensureIdentityBelongsToTenant, toSafeIdentity } from "../helpers";

export async function restore(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tenantSlug = req.params.tenantSlug as string;
    const tenant = await ensureTenantExistsBySlug(tenantSlug);
    const id = req.params.id as string;
    await ensureIdentityBelongsToTenant(id, tenant.id);
    const restored = await restoreIdentity(id);
    res.status(200).json(toSafeIdentity(restored));
  } catch (error) {
    next(error);
  }
}
