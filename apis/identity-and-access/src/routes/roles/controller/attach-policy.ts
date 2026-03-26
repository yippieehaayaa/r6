import { attachPolicyToRole } from "@r6/db-identity-and-access";
import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { ensureTenantExistsBySlug } from "../../tenants/helpers";
import { ensureRoleBelongsToTenant } from "../helpers";

const UuidSchema = z.string().uuid();

export async function attachPolicy(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tenantSlug = req.params.tenantSlug as string;
    const tenant = await ensureTenantExistsBySlug(tenantSlug);
    const id = req.params.id as string;
    await ensureRoleBelongsToTenant(id, tenant.id);
    const { policyId } = z.object({ policyId: UuidSchema }).parse(req.body);
    const result = await attachPolicyToRole({ roleId: id, policyId });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
