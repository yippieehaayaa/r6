import { recordCount } from "@r6/db-inventory";
import { RecordCountSchema } from "@r6/schemas/inventory";
import type { NextFunction, Request, Response } from "express";
import { extractTenantContext } from "../../tenants/helpers";

export async function recordCountHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { tenantId, performedBy } = extractTenantContext(req);
    const stockCountId = req.params.stockCountId as string;
    const body = RecordCountSchema.parse(req.body);

    const result = await recordCount({
      tenantId,
      performedBy,
      stockCountId,
      ...body,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
