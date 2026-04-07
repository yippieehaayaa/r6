import {
  assignRoleToIdentity,
  createIdentity,
  getIdentityById,
  getRoleByName,
  updateIdentity,
} from "@r6/db-identity-and-access";
import { ProvisionIdentitySchema } from "@r6/schemas/identity-and-access";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../../lib/errors";
import { toSafeIdentity } from "../../identities/helpers";
import { ensureTenantExistsBySlug } from "../helpers";

export async function provisionIdentityHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tenantSlug = req.params.tenantSlug as string;
    const tenant = await ensureTenantExistsBySlug(tenantSlug);
    const body = ProvisionIdentitySchema.parse(req.body);

    const targetRole = await getRoleByName(tenant.id, body.role);
    if (!targetRole) {
      throw new AppError(
        404,
        "not_found",
        `Role "${body.role}" not found for this tenant`,
      );
    }

    const identity = await createIdentity({
      tenantId: tenant.id,
      username: body.username,
      email: body.email ?? null,
      password: body.plainPassword,
      kind: "USER",
      mustChangePassword: false,
    });

    await updateIdentity(identity.id, { status: "ACTIVE" });

    await assignRoleToIdentity({
      identityId: identity.id,
      roleId: targetRole.id,
    });

    const fresh = await getIdentityById(identity.id);
    if (!fresh) {
      throw new AppError(
        500,
        "internal",
        "Failed to retrieve provisioned identity",
      );
    }

    res.status(201).json(toSafeIdentity(fresh));
  } catch (error) {
    next(error);
  }
}
