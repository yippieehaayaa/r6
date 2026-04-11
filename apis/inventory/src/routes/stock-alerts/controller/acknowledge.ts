import { acknowledgeAlert } from "@r6/db-inventory";
import { AlertActionSchema } from "@r6/schemas/inventory";
import type { NextFunction, Request, Response } from "express";
import { extractTenantContext } from "../../tenants/helpers";

export async function acknowledgeAlertHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { tenantId, performedBy } = extractTenantContext(req);
    const alertId = req.params.alertId as string;
    const body = AlertActionSchema.parse(req.body);

    const result = await acknowledgeAlert({
      tenantId,
      alertId,
      acknowledgedBy: performedBy,
      ...body,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
