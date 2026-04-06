import { assignRoleToIdentity, getRoleById } from "@r6/db-identity-and-access";
import { PROTECTED_ROLES } from "@r6/schemas/identity-and-access";
import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { AppError } from "../../../lib/errors";
import { ensureTenantExistsBySlug } from "../../tenants/helpers";
import { ensureIdentityBelongsToTenant, toSafeIdentity } from "../helpers";

const UuidSchema = z.uuid();

export async function assignRole(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tenantSlug = req.params.tenantSlug as string;
    const tenant = await ensureTenantExistsBySlug(tenantSlug);
    const id = req.params.id as string;
    await ensureIdentityBelongsToTenant(id, tenant.id);
    const { roleId } = z.object({ roleId: UuidSchema }).parse(req.body);

    const role = await getRoleById(roleId);
    if (role && (PROTECTED_ROLES as readonly string[]).includes(role.name)) {
      throw new AppError(
        403,
        "forbidden",
        "Cannot assign a protected role via this endpoint. Use the provision endpoint instead.",
      );
    }

    const result = await assignRoleToIdentity({ identityId: id, roleId });
    res.status(200).json(toSafeIdentity(result));
  } catch (error) {
    next(error);
  }
}
