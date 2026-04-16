import { softDeleteProduct, updateProduct } from "@r6/db-inventory";
import {
  GetProductParamsSchema,
  UpdateProductSchema,
} from "@r6/schemas/inventory";
import type { NextFunction, Request, Response } from "express";
import { extractTenantContext } from "../../tenants/helpers";

export async function updateProductHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { tenantId, performedBy } = extractTenantContext(req);
    const { id } = GetProductParamsSchema.parse(req.params);
    const body = UpdateProductSchema.parse(req.body);

    const result = await updateProduct({ tenantId, id, performedBy, ...body });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function deleteProductHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { tenantId, performedBy } = extractTenantContext(req);
    const { id } = GetProductParamsSchema.parse(req.params);

    const result = await softDeleteProduct({ tenantId, id, performedBy });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
