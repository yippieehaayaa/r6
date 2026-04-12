import { getCategory, listCategories } from "@r6/db-inventory";
import {
  GetCategoryParamsSchema,
  ListCategoriesQuerySchema,
} from "@r6/schemas/inventory";
import type { NextFunction, Request, Response } from "express";
import { extractTenantContext } from "../../tenants/helpers";

export async function listCategoriesHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { tenantId } = extractTenantContext(req);
    const query = ListCategoriesQuerySchema.parse(req.query);

    const result = await listCategories({ tenantId, ...query });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getCategoryHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { tenantId } = extractTenantContext(req);
    const { id } = GetCategoryParamsSchema.parse(req.params);

    const result = await getCategory({ tenantId, id });
    if (!result) {
      res
        .status(404)
        .json({ code: "not_found", message: "Category not found" });
      return;
    }
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
