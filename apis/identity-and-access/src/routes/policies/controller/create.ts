import { createPolicy } from "@r6/db-identity-and-access";
import { CreatePolicySchema } from "@r6/schemas/identity-and-access";
import type { NextFunction, Request, Response } from "express";
import { ensureTenantExistsBySlug } from "../../tenants/helpers";

export async function createPolicyHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tenantSlug = req.params.tenantSlug as string;
    const tenant = await ensureTenantExistsBySlug(tenantSlug);
    const body = CreatePolicySchema.parse(req.body);
    const policy = await createPolicy({ ...body, tenantId: tenant.id });
    res.status(201).json(policy);
  } catch (error) {
    next(error);
  }
}
