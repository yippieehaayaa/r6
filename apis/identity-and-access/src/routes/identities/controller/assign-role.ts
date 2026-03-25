import { assignRoleToIdentity } from "@r6/db-identity-and-access";
import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { ensureIdentityBelongsToTenant, toSafeIdentity } from "../helpers";

const UuidSchema = z.uuid();

export async function assignRole(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tenantId = req.params.tenantId as string;
    const id = req.params.id as string;
    await ensureIdentityBelongsToTenant(id, tenantId);
    const { roleId } = z.object({ roleId: UuidSchema }).parse(req.body);
    const result = await assignRoleToIdentity({ identityId: id, roleId });
    res.status(200).json(toSafeIdentity(result));
  } catch (error) {
    next(error);
  }
}
