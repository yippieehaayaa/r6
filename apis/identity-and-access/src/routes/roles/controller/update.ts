import { updateRole } from "@r6/db-identity-and-access";
import { UpdateRoleSchema } from "@r6/schemas/identity-and-access";
import type { NextFunction, Request, Response } from "express";
import { ensureTenantExistsBySlug } from "../../tenants/helpers";
import { ensureRoleBelongsToTenant } from "../helpers";

export async function updateRoleHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tenantSlug = req.params.tenantSlug as string;
    const tenant = await ensureTenantExistsBySlug(tenantSlug);
    const id = req.params.id as string;
    await ensureRoleBelongsToTenant(id, tenant.id);
    const body = UpdateRoleSchema.parse(req.body);
    const updated = await updateRole(id, body);
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
}
