import { listStockMovements } from "@r6/db-inventory";
import { ListStockMovementsQuerySchema } from "@r6/schemas/inventory";
import type { NextFunction, Request, Response } from "express";
import { extractTenantContext } from "../../tenants/helpers";

export async function listStockMovementsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { tenantId } = extractTenantContext(req);
    const query = ListStockMovementsQuerySchema.parse(req.query);
    const result = await listStockMovements({ tenantId, ...query });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
