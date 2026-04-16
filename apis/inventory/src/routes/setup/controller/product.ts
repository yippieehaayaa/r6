import { setupProduct } from "@r6/db-inventory";
import { ProductSetupSchema } from "@r6/schemas/inventory";
import type { NextFunction, Request, Response } from "express";
import { extractTenantContext } from "../../tenants/helpers";

export async function productSetupHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { tenantId, performedBy } = extractTenantContext(req);
    const body = ProductSetupSchema.parse(req.body);

    const result = await setupProduct({
      tenantId,
      performedBy,
      ...body,
    });

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}
