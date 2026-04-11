import { manualAdjustment } from "@r6/db-inventory";
import { ManualAdjustmentSchema } from "@r6/schemas/inventory";
import type { NextFunction, Request, Response } from "express";
import { extractTenantContext } from "../../tenants/helpers";

export async function manualAdjustmentHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { tenantId, performedBy } = extractTenantContext(req);
    const body = ManualAdjustmentSchema.parse(req.body);

    const result = await manualAdjustment({
      tenantId,
      performedBy,
      ...body,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
