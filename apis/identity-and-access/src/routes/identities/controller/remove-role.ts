import {
  getRoleById,
  removeRoleFromIdentity,
} from "@r6/db-identity-and-access";
import { PROTECTED_ROLES } from "@r6/schemas/identity-and-access";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../../lib/errors";
import { ensureTenantExistsBySlug } from "../../tenants/helpers";
import { ensureIdentityBelongsToTenant, toSafeIdentity } from "../helpers";

export async function removeRole(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tenantSlug = req.params.tenantSlug as string;
    const tenant = await ensureTenantExistsBySlug(tenantSlug);
    const id = req.params.id as string;
    const roleId = req.params.roleId as string;
    await ensureIdentityBelongsToTenant(id, tenant.id);

    const role = await getRoleById(roleId);
    if (role && (PROTECTED_ROLES as readonly string[]).includes(role.name)) {
      throw new AppError(
        403,
        "forbidden",
        "Cannot remove a protected role via this endpoint.",
      );
    }

    const result = await removeRoleFromIdentity({ identityId: id, roleId });
    res.status(200).json(toSafeIdentity(result));
  } catch (error) {
    next(error);
  }
}
