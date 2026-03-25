import { softDeleteIdentity } from "@r6/db-identity-and-access";
import type { NextFunction, Request, Response } from "express";
import { ensureIdentityBelongsToTenant } from "../helpers";

export async function remove(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tenantId = req.params.tenantId as string;
    const id = req.params.id as string;
    await ensureIdentityBelongsToTenant(id, tenantId);
    await softDeleteIdentity(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
