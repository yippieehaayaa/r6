import { softDeleteTenant } from "@r6/db-identity-and-access";
import type { NextFunction, Request, Response } from "express";
import { ensureTenantExistsBySlug } from "../helpers";

export async function remove(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tenantSlug = req.params.tenantSlug as string;
    const tenant = await ensureTenantExistsBySlug(tenantSlug);
    await softDeleteTenant(tenant.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
