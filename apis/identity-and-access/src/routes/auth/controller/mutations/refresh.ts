import {
  createRefreshToken,
  getIdentityWithPermissions,
  getRefreshToken,
  revokeRefreshToken,
} from "@r6/db-identity-and-access";
import type { NextFunction, Request, Response } from "express";
import { env } from "../../../../config";
import { AppError } from "../../../../lib/errors";
import {
  generateDeviceFingerprint,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../../../lib/jwt";
import { buildTokenClaims } from "../../helpers";

export async function refresh(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const raw: string | undefined = req.cookies?.refreshToken;
    if (!raw)
      throw new AppError(
        400,
        "validation_error",
        "refresh token cookie is required",
      );

    const payload = await verifyRefreshToken(raw).catch(() => {
      throw new AppError(
        401,
        "invalid_token",
        "Invalid or expired refresh token",
      );
    });

    if ((payload as Record<string, unknown>).tokenType !== "refresh") {
      throw new AppError(401, "invalid_token", "Invalid token type");
    }

    if (typeof payload.jti !== "string" || typeof payload.sub !== "string") {
      throw new AppError(401, "invalid_token", "Malformed token");
    }

    // ── Stateful checks ──────────────────────────────────────
    const stored = await getRefreshToken(payload.jti);
    if (!stored) throw new AppError(401, "invalid_token", "Token not found");

    if (stored.revokedAt !== null)
      throw new AppError(
        401,
        "token_revoked",
        "Refresh token has been revoked",
      );

    // ── Device binding ───────────────────────────────────────
    const currentFingerprint = generateDeviceFingerprint(
      req.headers["user-agent"] ?? "",
      req.ip ?? "",
    );
    if (currentFingerprint !== stored.deviceFingerprint)
      throw new AppError(
        401,
        "device_mismatch",
        "Token was issued to a different device",
      );

    // ── Token rotation (invalidate old, issue new) ───────────
    await revokeRefreshToken(payload.jti);

    const full = await getIdentityWithPermissions(payload.sub);
    if (!full) throw new AppError(401, "invalid_token", "Identity not found");
    if (full.status !== "ACTIVE") {
      throw new AppError(403, "account_inactive", "Account is not active");
    }

    const claims = buildTokenClaims(full);

    const [accessToken, { token: newRefreshToken, jti: newJti }] =
      await Promise.all([
        signAccessToken({
          sub: full.id,
          kind: full.kind,
          tenantId: full.tenantId ?? null,
          permissions: claims.permissions,
        }),
        signRefreshToken(full.id),
      ]);

    await createRefreshToken({
      jti: newJti,
      identityId: full.id,
      deviceFingerprint: currentFingerprint,
      userAgent: req.headers["user-agent"],
      ipAddress: req.ip,
      expiresAt: new Date(Date.now() + env.JWT_REFRESH_TTL_MS),
    });

    const isProd = env.NODE_ENV === "production";
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: env.JWT_REFRESH_TTL_MS,
      path: env.COOKIE_PATH,
    });

    res.status(200).json({ accessToken });
  } catch (error) {
    next(error);
  }
}
