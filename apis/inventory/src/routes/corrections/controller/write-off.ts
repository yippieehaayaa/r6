import { writeOffStock } from "@r6/db-inventory";
import { WriteOffStockSchema } from "@r6/schemas/inventory";
import type { NextFunction, Request, Response } from "express";
import { extractTenantContext } from "../../tenants/helpers";

export async function writeOffHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { tenantId, performedBy } = extractTenantContext(req);
    const body = WriteOffStockSchema.parse(req.body);

    const result = await writeOffStock({
      tenantId,
      performedBy,
      ...body,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
