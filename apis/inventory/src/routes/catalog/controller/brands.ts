import { getBrand, listBrands } from "@r6/db-inventory";
import {
  GetBrandParamsSchema,
  ListBrandsQuerySchema,
} from "@r6/schemas/inventory";
import type { NextFunction, Request, Response } from "express";
import { extractTenantContext } from "../../tenants/helpers";

export async function listBrandsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { tenantId } = extractTenantContext(req);
    const query = ListBrandsQuerySchema.parse(req.query);

    const result = await listBrands({ tenantId, ...query });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getBrandHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { tenantId } = extractTenantContext(req);
    const { id } = GetBrandParamsSchema.parse(req.params);

    const result = await getBrand({ tenantId, id });
    if (!result) {
      res.status(404).json({ code: "not_found", message: "Brand not found" });
      return;
    }
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
