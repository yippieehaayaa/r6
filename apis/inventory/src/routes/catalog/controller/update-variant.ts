import { softDeleteVariant, updateVariant } from "@r6/db-inventory";
import {
  GetVariantParamsSchema,
  UpdateVariantSchema,
} from "@r6/schemas/inventory";
import type { NextFunction, Request, Response } from "express";
import { extractTenantContext } from "../../tenants/helpers";

export async function updateVariantHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { tenantId, performedBy } = extractTenantContext(req);
    const { id } = GetVariantParamsSchema.parse(req.params);
    const body = UpdateVariantSchema.parse(req.body);

    const result = await updateVariant({ tenantId, id, performedBy, ...body });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function deleteVariantHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { tenantId, performedBy } = extractTenantContext(req);
    const { id } = GetVariantParamsSchema.parse(req.params);

    const result = await softDeleteVariant({ tenantId, id, performedBy });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
