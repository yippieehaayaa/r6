import {
  createIdentity,
  getIdentityWithRolesAndPolicies,
  getTenantById,
  updateIdentity,
} from "@r6/db-identity-and-access";
import { CreateIdentitySchema } from "@r6/schemas/identity-and-access";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../../lib/errors";
import { signAccessToken, signRefreshToken } from "../../../lib/jwt";
import { buildTokenClaims, toSafeIdentity } from "../helpers";

export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const body = CreateIdentitySchema.parse(req.body);

    if (body.kind && body.kind !== "USER") {
      throw new AppError(
        400,
        "invalid_kind",
        "Only USER identities can self-register",
      );
    }

    if (!body.tenantId) {
      throw new AppError(
        400,
        "tenant_required",
        "tenantId is required for registration",
      );
    }

    const tenant = await getTenantById(body.tenantId);
    if (!tenant) throw new AppError(404, "not_found", "Tenant not found");
    if (!tenant.isActive)
      throw new AppError(403, "tenant_inactive", "Tenant is not active");

    const identity = await createIdentity({
      tenantId: body.tenantId,
      username: body.username,
      email: body.email ?? null,
      password: body.plainPassword,
      kind: "USER",
      mustChangePassword: false,
    });

    await updateIdentity(identity.id, { status: "ACTIVE" });

    const full = await getIdentityWithRolesAndPolicies(identity.id);
    if (!full)
      throw new AppError(
        500,
        "internal",
        "Failed to load identity after creation",
      );

    const claims = buildTokenClaims(full);
    const [accessToken, refreshToken] = await Promise.all([
      signAccessToken({
        sub: full.id,
        kind: full.kind,
        tenantId: full.tenantId,
        roles: claims.roles,
        permissions: claims.permissions,
      }),
      signRefreshToken(full.id),
    ]);

    res
      .status(201)
      .json({ identity: toSafeIdentity(full), accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
}
