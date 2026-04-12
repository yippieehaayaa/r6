import { listUoms } from "@r6/db-inventory";
import { ListUomsQuerySchema } from "@r6/schemas/inventory";
import type { NextFunction, Request, Response } from "express";
import { extractTenantContext } from "../../tenants/helpers";

export async function listUomsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { tenantId } = extractTenantContext(req);
    const query = ListUomsQuerySchema.parse(req.query);

    const result = await listUoms({ tenantId, ...query });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
