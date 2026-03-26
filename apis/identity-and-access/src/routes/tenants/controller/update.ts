import { updateTenant } from "@r6/db-identity-and-access";
import { UpdateTenantSchema } from "@r6/schemas/identity-and-access";
import type { NextFunction, Request, Response } from "express";
import { ensureTenantExistsBySlug } from "../helpers";

export async function updateTenantHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tenantSlug = req.params.tenantSlug as string;
    const tenant = await ensureTenantExistsBySlug(tenantSlug);
    const body = UpdateTenantSchema.parse(req.body);
    const updated = await updateTenant(tenant.id, body);
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
}
