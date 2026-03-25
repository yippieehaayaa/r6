import { getIdentityWithRolesAndPolicies } from "@r6/db-identity-and-access";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../../lib/errors";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../../lib/jwt";
import { buildTokenClaims } from "../helpers";

export async function refresh(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { token } = req.body as { token?: string };
    if (!token)
      throw new AppError(400, "validation_error", "token is required");

    const payload = await verifyRefreshToken(token).catch(() => {
      throw new AppError(
        401,
        "invalid_token",
        "Invalid or expired refresh token",
      );
    });

    if ((payload as Record<string, unknown>).tokenType !== "refresh") {
      throw new AppError(401, "invalid_token", "Invalid token type");
    }

    if (typeof payload.sub !== "string") {
      throw new AppError(401, "invalid_token", "Token subject missing");
    }

    const full = await getIdentityWithRolesAndPolicies(payload.sub);
    if (!full) throw new AppError(401, "invalid_token", "Identity not found");
    if (full.status !== "ACTIVE") {
      throw new AppError(
        403,
        "account_inactive",
        `Account status is ${full.status}`,
      );
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

    res.status(200).json({ accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
}
