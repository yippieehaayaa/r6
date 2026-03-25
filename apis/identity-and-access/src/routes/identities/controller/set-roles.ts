import { setRolesForIdentity } from "@r6/db-identity-and-access";
import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { ensureIdentityBelongsToTenant, toSafeIdentity } from "../helpers";

const UuidSchema = z.uuid();

export async function setRoles(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tenantId = req.params.tenantId as string;
    const id = req.params.id as string;
    await ensureIdentityBelongsToTenant(id, tenantId);
    const { roleIds } = z
      .object({ roleIds: z.array(UuidSchema) })
      .parse(req.body);
    const result = await setRolesForIdentity(id, roleIds);
    res.status(200).json(toSafeIdentity(result));
  } catch (error) {
    next(error);
  }
}
