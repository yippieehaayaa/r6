import { setPoliciesForRole } from "@r6/db-identity-and-access";
import { AssignPoliciesToRoleSchema } from "@r6/schemas/identity-and-access";
import type { NextFunction, Request, Response } from "express";
import { ensureRoleBelongsToTenant } from "../helpers";

export async function setPolicies(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tenantId = req.params.tenantId as string;
    const id = req.params.id as string;
    await ensureRoleBelongsToTenant(id, tenantId);
    const { policyIds } = AssignPoliciesToRoleSchema.parse(req.body);
    const result = await setPoliciesForRole(id, policyIds);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
