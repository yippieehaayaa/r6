import type { NextFunction, Request, Response } from "express";
import { ensureTenantExists } from "../helpers";

export async function getTenant(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tenantId = req.params.tenantId as string;
    const tenant = await ensureTenantExists(tenantId);
    res.status(200).json(tenant);
  } catch (error) {
    next(error);
  }
}
