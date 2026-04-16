import { softDeleteBrand, updateBrand } from "@r6/db-inventory";
import { GetBrandParamsSchema, UpdateBrandSchema } from "@r6/schemas/inventory";
import type { NextFunction, Request, Response } from "express";
import { extractTenantContext } from "../../tenants/helpers";

export async function updateBrandHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { tenantId, performedBy } = extractTenantContext(req);
    const { id } = GetBrandParamsSchema.parse(req.params);
    const body = UpdateBrandSchema.parse(req.body);

    const result = await updateBrand({ tenantId, id, performedBy, ...body });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function deleteBrandHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { tenantId, performedBy } = extractTenantContext(req);
    const { id } = GetBrandParamsSchema.parse(req.params);

    const result = await softDeleteBrand({ tenantId, id, performedBy });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
