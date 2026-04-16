import { reserveStock } from "@r6/db-inventory";
import { ReserveStockSchema } from "@r6/schemas/inventory";
import type { NextFunction, Request, Response } from "express";
import { extractTenantContext } from "../../tenants/helpers";

export async function reserveStockHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { tenantId, performedBy } = extractTenantContext(req);
    const body = ReserveStockSchema.parse(req.body);

    const result = await reserveStock({
      tenantId,
      reservedBy: performedBy,
      ...body,
    });

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}
