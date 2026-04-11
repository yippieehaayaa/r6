import { checkAvailabilityBatch } from "@r6/db-inventory";
import { CheckAvailabilityBatchSchema } from "@r6/schemas/inventory";
import type { NextFunction, Request, Response } from "express";
import { extractTenantContext } from "../../tenants/helpers";

export async function checkAvailabilityBatchHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { tenantId } = extractTenantContext(req);
    const body = CheckAvailabilityBatchSchema.parse(req.body);

    const result = await checkAvailabilityBatch({
      tenantId,
      ...body,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
