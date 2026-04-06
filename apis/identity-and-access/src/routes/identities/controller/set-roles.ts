import { getRoleById, setRolesForIdentity } from "@r6/db-identity-and-access";
import { PROTECTED_ROLES } from "@r6/schemas/identity-and-access";
import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { AppError } from "../../../lib/errors";
import { ensureTenantExistsBySlug } from "../../tenants/helpers";
import { ensureIdentityBelongsToTenant, toSafeIdentity } from "../helpers";

const UuidSchema = z.uuid();

export async function setRoles(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tenantSlug = req.params.tenantSlug as string;
    const tenant = await ensureTenantExistsBySlug(tenantSlug);
    const id = req.params.id as string;
    await ensureIdentityBelongsToTenant(id, tenant.id);
    const { roleIds } = z
      .object({ roleIds: z.array(UuidSchema) })
      .parse(req.body);

    const roles = await Promise.all(roleIds.map((rid) => getRoleById(rid)));
    const protectedMatch = roles.find(
      (r) => r && (PROTECTED_ROLES as readonly string[]).includes(r.name),
    );
    if (protectedMatch) {
      throw new AppError(
        403,
        "forbidden",
        `Cannot assign protected role "${protectedMatch.name}" via this endpoint. Use the provision endpoint instead.`,
      );
    }

    const result = await setRolesForIdentity(id, roleIds);
    res.status(200).json(toSafeIdentity(result));
  } catch (error) {
    next(error);
  }
}
