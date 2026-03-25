import { softDeleteTenant } from "@r6/db-identity-and-access";
import type { NextFunction, Request, Response } from "express";
import { ensureTenantExists } from "../helpers";

export async function remove(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tenantId = req.params.tenantId as string;
    await ensureTenantExists(tenantId);
    await softDeleteTenant(tenantId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
