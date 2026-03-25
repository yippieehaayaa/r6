import { getRoleWithPolicies } from "@r6/db-identity-and-access";
import type { NextFunction, Request, Response } from "express";
import { ensureRoleBelongsToTenant } from "../helpers";

export async function getRole(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tenantId = req.params.tenantId as string;
    const id = req.params.id as string;
    await ensureRoleBelongsToTenant(id, tenantId);
    const role = await getRoleWithPolicies(id);
    res.status(200).json(role);
  } catch (error) {
    next(error);
  }
}
