import { setupCategoryAndBrand } from "@r6/db-inventory";
import { CategoryBrandSetupSchema } from "@r6/schemas/inventory";
import type { NextFunction, Request, Response } from "express";
import { extractTenantContext } from "../../tenants/helpers";

export async function categoryBrandSetupHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { tenantId, performedBy } = extractTenantContext(req);
    const body = CategoryBrandSetupSchema.parse(req.body);

    const result = await setupCategoryAndBrand({
      tenantId,
      performedBy,
      ...body,
    });

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}
