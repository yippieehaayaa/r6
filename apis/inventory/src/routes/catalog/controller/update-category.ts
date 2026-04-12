import { softDeleteCategory, updateCategory } from "@r6/db-inventory";
import {
  GetCategoryParamsSchema,
  UpdateCategorySchema,
} from "@r6/schemas/inventory";
import type { NextFunction, Request, Response } from "express";
import { extractTenantContext } from "../../tenants/helpers";

export async function updateCategoryHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { tenantId, performedBy } = extractTenantContext(req);
    const { id } = GetCategoryParamsSchema.parse(req.params);
    const body = UpdateCategorySchema.parse(req.body);

    const result = await updateCategory({
      tenantId,
      id,
      performedBy,
      ...body,
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function deleteCategoryHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { tenantId, performedBy } = extractTenantContext(req);
    const { id } = GetCategoryParamsSchema.parse(req.params);

    const result = await softDeleteCategory({ tenantId, id, performedBy });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
