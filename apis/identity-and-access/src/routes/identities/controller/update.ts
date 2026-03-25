import { updateIdentity } from "@r6/db-identity-and-access";
import { UpdateIdentitySchema } from "@r6/schemas/identity-and-access";
import type { NextFunction, Request, Response } from "express";
import { ensureIdentityBelongsToTenant, toSafeIdentity } from "../helpers";

export async function updateIdentityHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tenantId = req.params.tenantId as string;
    const id = req.params.id as string;
    await ensureIdentityBelongsToTenant(id, tenantId);
    const body = UpdateIdentitySchema.parse(req.body);
    const updated = await updateIdentity(id, body);
    res.status(200).json(toSafeIdentity(updated));
  } catch (error) {
    next(error);
  }
}
