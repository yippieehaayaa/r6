import { verifyPassword } from "@r6/bcrypt";
import { hmac } from "@r6/crypto";
import {
  getIdentityByEmail,
  getIdentityByUsername,
  getIdentityWithRolesAndPolicies,
  updateIdentity,
} from "@r6/db-identity-and-access";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../../lib/errors";
import { signAccessToken, signRefreshToken } from "../../../lib/jwt";
import { buildTokenClaims, toSafeIdentity } from "../helpers";

const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_LOCK_MS = 15 * 60 * 1000; // 15 minutes

export async function login(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { username, email, password } = req.body as {
      username?: string;
      email?: string;
      password: string;
    };

    if (!password)
      throw new AppError(400, "validation_error", "password is required");
    if (!username && !email) {
      throw new AppError(
        400,
        "validation_error",
        "username or email is required",
      );
    }

    const tenantId: string | null =
      (req.body as { tenantId?: string }).tenantId ?? null;

    const identity = username
      ? await getIdentityByUsername(tenantId, username)
      : await getIdentityByEmail(tenantId, email as string);

    if (!identity)
      throw new AppError(401, "invalid_credentials", "Invalid credentials");

    if (identity.lockedUntil && identity.lockedUntil > new Date()) {
      throw new AppError(
        423,
        "account_locked",
        "Account is temporarily locked due to too many failed login attempts",
      );
    }

    if (identity.status !== "ACTIVE") {
      throw new AppError(
        403,
        "account_inactive",
        `Account status is ${identity.status}`,
      );
    }

    const valid = await verifyPassword(hmac(password), identity.hash);

    if (!valid) {
      const newAttempts = identity.failedLoginAttempts + 1;
      const lock = newAttempts >= LOGIN_MAX_ATTEMPTS;
      await updateIdentity(identity.id, {
        failedLoginAttempts: newAttempts,
        lockedUntil: lock ? new Date(Date.now() + LOGIN_LOCK_MS) : undefined,
      });
      throw new AppError(401, "invalid_credentials", "Invalid credentials");
    }

    await updateIdentity(identity.id, {
      failedLoginAttempts: 0,
      lockedUntil: null,
    });

    const full = await getIdentityWithRolesAndPolicies(identity.id);
    if (!full) throw new AppError(500, "internal", "Failed to load identity");

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
