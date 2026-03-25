import type { NextFunction, Request, Response } from "express";
import { ensureIdentityBelongsToTenant, toSafeIdentity } from "../helpers";

export async function getIdentity(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tenantId = req.params.tenantId as string;
    const id = req.params.id as string;
    const identity = await ensureIdentityBelongsToTenant(id, tenantId);
    res.status(200).json(toSafeIdentity(identity));
  } catch (error) {
    next(error);
  }
}
