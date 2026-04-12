import { getStockAlert, listStockAlerts } from "@r6/db-inventory";
import {
  GetByUuidParamsSchema,
  ListStockAlertsQuerySchema,
} from "@r6/schemas/inventory";
import type { NextFunction, Request, Response } from "express";
import { extractTenantContext } from "../../tenants/helpers";

export async function listStockAlertsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { tenantId } = extractTenantContext(req);
    const query = ListStockAlertsQuerySchema.parse(req.query);
    const result = await listStockAlerts({ tenantId, ...query });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getStockAlertHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { tenantId } = extractTenantContext(req);
    const { id } = GetByUuidParamsSchema.parse(req.params);
    const result = await getStockAlert({ tenantId, id });
    if (!result) {
      res.status(404).json({ code: "not_found", message: "Alert not found" });
      return;
    }
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
