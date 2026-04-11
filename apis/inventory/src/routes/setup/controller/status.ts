import { getTenantSetupStatus } from "@r6/db-inventory";
import type { NextFunction, Request, Response } from "express";
import { extractTenantContext } from "../../tenants/helpers";

export async function setupStatusHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { tenantId } = extractTenantContext(req);
    const result = await getTenantSetupStatus(tenantId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
