import { getProduct, listProducts } from "@r6/db-inventory";
import {
  GetProductParamsSchema,
  ListProductsQuerySchema,
} from "@r6/schemas/inventory";
import type { NextFunction, Request, Response } from "express";
import { extractTenantContext } from "../../tenants/helpers";

export async function listProductsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { tenantId } = extractTenantContext(req);
    const query = ListProductsQuerySchema.parse(req.query);

    const result = await listProducts({ tenantId, ...query });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getProductHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { tenantId } = extractTenantContext(req);
    const { id } = GetProductParamsSchema.parse(req.params);

    const result = await getProduct({ tenantId, id });
    if (!result) {
      res.status(404).json({ code: "not_found", message: "Product not found" });
      return;
    }
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
