import { setupCatalog } from "@r6/db-inventory";
import { CatalogSetupSchema } from "@r6/schemas/inventory";
import type { NextFunction, Request, Response } from "express";
import { extractTenantContext } from "../../tenants/helpers";

export async function catalogSetupHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { tenantId, performedBy } = extractTenantContext(req);
    const body = CatalogSetupSchema.parse(req.body);

    const result = await setupCatalog({
      tenantId,
      performedBy,
      ...body,
    });

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}
