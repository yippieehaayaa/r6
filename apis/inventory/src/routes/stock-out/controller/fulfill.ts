import { fulfillSale } from "@r6/db-inventory";
import { FulfillSaleSchema } from "@r6/schemas/inventory";
import type { NextFunction, Request, Response } from "express";
import { extractTenantContext } from "../../tenants/helpers";

export async function fulfillSaleHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { tenantId, performedBy } = extractTenantContext(req);
    const body = FulfillSaleSchema.parse(req.body);

    const result = await fulfillSale({
      tenantId,
      performedBy,
      ...body,
    });

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}
