import { detachPolicyFromRole } from "@r6/db-identity-and-access";
import type { NextFunction, Request, Response } from "express";
import { ensureRoleBelongsToTenant } from "../helpers";

export async function detachPolicy(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tenantId = req.params.tenantId as string;
    const id = req.params.id as string;
    const policyId = req.params.policyId as string;
    await ensureRoleBelongsToTenant(id, tenantId);
    const result = await detachPolicyFromRole({ roleId: id, policyId });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
