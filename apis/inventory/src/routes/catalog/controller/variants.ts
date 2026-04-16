import { getVariant, listVariants } from "@r6/db-inventory";
import {
  GetVariantParamsSchema,
  ListVariantsQuerySchema,
} from "@r6/schemas/inventory";
import type { NextFunction, Request, Response } from "express";
import { extractTenantContext } from "../../tenants/helpers";

export async function listVariantsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { tenantId } = extractTenantContext(req);
    const query = ListVariantsQuerySchema.parse(req.query);

    const result = await listVariants({ tenantId, ...query });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getVariantHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { tenantId } = extractTenantContext(req);
    const { id } = GetVariantParamsSchema.parse(req.params);

    const result = await getVariant({ tenantId, id });
    if (!result) {
      res.status(404).json({ code: "not_found", message: "Variant not found" });
      return;
    }
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
