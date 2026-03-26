import { verifyIdentity } from "@r6/db-identity-and-access";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../../lib/errors";
import { signAccessToken, signRefreshToken } from "../../../lib/jwt";
import { buildTokenClaims, toSafeIdentity } from "../helpers";

export async function login(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { username, email, password, tenantId } = req.body as {
      username?: string;
      email?: string;
      password: string;
      tenantId?: string;
    };

    if (!password)
      throw new AppError(400, "validation_error", "password is required");
    if (!username && !email)
      throw new AppError(400, "validation_error", "username or email is required");

    let full: Awaited<ReturnType<typeof verifyIdentity>>;
    try {
      full = await verifyIdentity({ tenantId: tenantId ?? null, username, email, password });
    } catch (e) {
      const msg = (e as Error).message;
      if (msg === "invalid_credentials")
        throw new AppError(401, "invalid_credentials", "Invalid credentials");
      if (msg === "account_locked")
        throw new AppError(423, "account_locked", "Account is temporarily locked due to too many failed login attempts");
      if (msg.startsWith("account_inactive"))
        throw new AppError(403, "account_inactive", `Account status is ${msg.split(":")[1]}`);
      throw e;
    }

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
      .status(200)
      .json({ identity: toSafeIdentity(full), accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
}
