import { updateTenant } from "@r6/db-identity-and-access";
import { UpdateTenantSchema } from "@r6/schemas/identity-and-access";
import type { NextFunction, Request, Response } from "express";
import { ensureTenantExists } from "../helpers";

export async function updateTenantHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tenantId = req.params.tenantId as string;
    await ensureTenantExists(tenantId);
    const body = UpdateTenantSchema.parse(req.body);
    const updated = await updateTenant(tenantId, body);
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
}
