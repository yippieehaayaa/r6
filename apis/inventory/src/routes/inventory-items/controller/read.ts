import { listInventoryItems } from "@r6/db-inventory";
import { ListInventoryItemsQuerySchema } from "@r6/schemas/inventory";
import type { NextFunction, Request, Response } from "express";
import { extractTenantContext } from "../../tenants/helpers";

export async function listInventoryItemsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { tenantId } = extractTenantContext(req);
    const query = ListInventoryItemsQuerySchema.parse(req.query);
    const result = await listInventoryItems({ tenantId, ...query });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
