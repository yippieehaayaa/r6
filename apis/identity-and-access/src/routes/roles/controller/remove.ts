import { softDeleteRole } from "@r6/db-identity-and-access";
import type { NextFunction, Request, Response } from "express";
import { ensureRoleBelongsToTenant } from "../helpers";

export async function remove(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tenantId = req.params.tenantId as string;
    const id = req.params.id as string;
    await ensureRoleBelongsToTenant(id, tenantId);
    await softDeleteRole(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
