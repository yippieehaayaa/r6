import { onboardTenant } from "@r6/db-inventory";
import { OnboardTenantSchema } from "@r6/schemas/inventory";
import type { NextFunction, Request, Response } from "express";
import { extractTenantContext } from "../../tenants/helpers";

export async function onboardTenantHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { tenantId, performedBy } = extractTenantContext(req);
    const body = OnboardTenantSchema.parse(req.body);

    const result = await onboardTenant({
      tenantId,
      performedBy,
      ...body,
    });

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}
