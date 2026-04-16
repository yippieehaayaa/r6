import { listStockReservations } from "@r6/db-inventory";
import { ListStockReservationsQuerySchema } from "@r6/schemas/inventory";
import type { NextFunction, Request, Response } from "express";
import { extractTenantContext } from "../../tenants/helpers";

export async function listStockReservationsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { tenantId } = extractTenantContext(req);
    const query = ListStockReservationsQuerySchema.parse(req.query);
    const result = await listStockReservations({ tenantId, ...query });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
