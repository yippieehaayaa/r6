import {
  changePassword,
  revokeAllRefreshTokensForIdentity,
} from "@r6/db-identity-and-access";
import { ChangePasswordSchema } from "@r6/schemas/identity-and-access";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../../lib/errors";
import { revokeAccessToken } from "../../../lib/token-denylist";

export async function updatePassword(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (typeof req.jwtPayload?.sub !== "string") {
      throw new AppError(401, "unauthorized", "Authentication required");
    }

    const payload = ChangePasswordSchema.parse(req.body);

    await changePassword(req.jwtPayload.sub, {
      currentPassword: payload.currentPassword,
      newPassword: payload.newPassword,
    });

    // Invalidate all sessions so every device is forced to re-authenticate.
    await revokeAllRefreshTokensForIdentity(req.jwtPayload.sub);

    // Denylist the current access token for its remaining lifetime.
    const { jti, exp } = req.jwtPayload as { jti?: string; exp?: number };
    if (jti && typeof exp === "number") {
      await revokeAccessToken(jti, exp * 1000);
    }

    const isProd = process.env.NODE_ENV === "production";
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
    });

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    next(error);
  }
}
