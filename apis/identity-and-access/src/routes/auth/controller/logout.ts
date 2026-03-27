import { revokeRefreshToken } from "@r6/db-identity-and-access";
import type { NextFunction, Request, Response } from "express";
import { verifyRefreshToken } from "../../../lib/jwt";
import { revokeAccessToken } from "../../../lib/token-denylist";

export async function logout(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { jti, exp } = req.jwtPayload as { jti?: string; exp?: number };

    // Blacklist the access token in Redis for its remaining lifetime.
    if (jti && typeof exp === "number") {
      await revokeAccessToken(jti, exp * 1000);
    }

    // Revoke the refresh token in the database if the cookie is present.
    const raw: string | undefined = req.cookies?.refreshToken;
    if (raw) {
      const payload = await verifyRefreshToken(raw).catch(() => null);
      if (payload && typeof payload.jti === "string") {
        await revokeRefreshToken(payload.jti).catch(() => null);
      }
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
}
