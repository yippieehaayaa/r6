import { listInventoryLots } from "@r6/db-inventory";
import { ListInventoryLotsQuerySchema } from "@r6/schemas/inventory";
import type { NextFunction, Request, Response } from "express";
import { extractTenantContext } from "../../tenants/helpers";

export async function listInventoryLotsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { tenantId } = extractTenantContext(req);
    const query = ListInventoryLotsQuerySchema.parse(req.query);
    const result = await listInventoryLots({ tenantId, ...query });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
