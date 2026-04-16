import { getWarehouse, listWarehouses } from "@r6/db-inventory";
import {
  GetByUuidParamsSchema,
  ListWarehousesQuerySchema,
} from "@r6/schemas/inventory";
import type { NextFunction, Request, Response } from "express";
import { extractTenantContext } from "../../tenants/helpers";

export async function listWarehousesHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { tenantId } = extractTenantContext(req);
    const query = ListWarehousesQuerySchema.parse(req.query);
    const result = await listWarehouses({ tenantId, ...query });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getWarehouseHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { tenantId } = extractTenantContext(req);
    const { id } = GetByUuidParamsSchema.parse(req.params);
    const result = await getWarehouse({ tenantId, id });
    if (!result) {
      res
        .status(404)
        .json({ code: "not_found", message: "Warehouse not found" });
      return;
    }
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
