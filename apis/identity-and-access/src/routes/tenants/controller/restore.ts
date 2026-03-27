import { restoreTenant } from "@r6/db-identity-and-access";
import type { NextFunction, Request, Response } from "express";
import { ensureTenantExistsBySlug } from "../helpers";

export async function restore(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tenantSlug = req.params.tenantSlug as string;
    const tenant = await ensureTenantExistsBySlug(tenantSlug);
    const restored = await restoreTenant(tenant.id);
    res.status(200).json(restored);
  } catch (error) {
    next(error);
  }
}
