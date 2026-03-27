import { createRole } from "@r6/db-identity-and-access";
import { CreateRoleSchema } from "@r6/schemas/identity-and-access";
import type { NextFunction, Request, Response } from "express";
import { ensureTenantExistsBySlug } from "../../tenants/helpers";

export async function createRoleHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tenantSlug = req.params.tenantSlug as string;
    const tenant = await ensureTenantExistsBySlug(tenantSlug);
    const body = CreateRoleSchema.parse(req.body);
    const role = await createRole({
      tenantId: tenant.id,
      name: body.name,
      description: body.description ?? null,
    });
    res.status(201).json(role);
  } catch (error) {
    next(error);
  }
}
