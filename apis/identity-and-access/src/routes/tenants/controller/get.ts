import type { NextFunction, Request, Response } from "express";
import { ensureTenantExistsBySlug } from "../helpers";

export async function getTenant(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tenantSlug = req.params.tenantSlug as string;
    const tenant = await ensureTenantExistsBySlug(tenantSlug);
    res.status(200).json(tenant);
  } catch (error) {
    next(error);
  }
}
