import { reconcileStockCount } from "@r6/db-inventory";
import { ReconcileStockCountSchema } from "@r6/schemas/inventory";
import type { NextFunction, Request, Response } from "express";
import { extractTenantContext } from "../../tenants/helpers";

export async function reconcileStockCountHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { tenantId, performedBy } = extractTenantContext(req);
    const stockCountId = req.params.stockCountId as string;
    const body = ReconcileStockCountSchema.parse(req.body);

    const result = await reconcileStockCount({
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
