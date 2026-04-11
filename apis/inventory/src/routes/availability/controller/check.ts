import { checkAvailability } from "@r6/db-inventory";
import { CheckAvailabilityQuerySchema } from "@r6/schemas/inventory";
import type { NextFunction, Request, Response } from "express";
import { extractTenantContext } from "../../tenants/helpers";

export async function checkAvailabilityHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { tenantId } = extractTenantContext(req);
    const query = CheckAvailabilityQuerySchema.parse(req.query);

    const result = await checkAvailability({
      tenantId,
      ...query,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
