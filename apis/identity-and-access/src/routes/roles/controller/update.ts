import { updateRole } from "@r6/db-identity-and-access";
import { UpdateRoleSchema } from "@r6/schemas/identity-and-access";
import type { NextFunction, Request, Response } from "express";
import { ensureRoleBelongsToTenant } from "../helpers";

export async function updateRoleHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tenantId = req.params.tenantId as string;
    const id = req.params.id as string;
    await ensureRoleBelongsToTenant(id, tenantId);
    const body = UpdateRoleSchema.parse(req.body);
    const updated = await updateRole(id, body);
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
}
