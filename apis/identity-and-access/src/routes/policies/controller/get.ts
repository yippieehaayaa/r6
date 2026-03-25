import type { NextFunction, Request, Response } from "express";
import { ensurePolicyBelongsToTenant } from "../helpers";

export async function getPolicy(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tenantId = req.params.tenantId as string;
    const id = req.params.id as string;
    const policy = await ensurePolicyBelongsToTenant(id, tenantId);
    res.status(200).json(policy);
  } catch (error) {
    next(error);
  }
}
