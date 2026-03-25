import { removeRoleFromIdentity } from "@r6/db-identity-and-access";
import type { NextFunction, Request, Response } from "express";
import { ensureIdentityBelongsToTenant, toSafeIdentity } from "../helpers";

export async function removeRole(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tenantId = req.params.tenantId as string;
    const id = req.params.id as string;
    const roleId = req.params.roleId as string;
    await ensureIdentityBelongsToTenant(id, tenantId);
    const result = await removeRoleFromIdentity({ identityId: id, roleId });
    res.status(200).json(toSafeIdentity(result));
  } catch (error) {
    next(error);
  }
}
