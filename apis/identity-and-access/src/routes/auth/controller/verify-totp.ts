import {
  createRefreshToken,
  getIdentityWithPermissions,
} from "@r6/db-identity-and-access";
import type { NextFunction, Request, Response } from "express";
import { env } from "../../../config";
import { AppError } from "../../../lib/errors";
import {
  generateDeviceFingerprint,
  signAccessToken,
  signRefreshToken,
  verifyTotpChallengeToken,
} from "../../../lib/jwt";
import { verifyTotpCode } from "../../../lib/totp";
import { buildTokenClaims } from "../helpers";

export async function verifyTotp(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { challengeToken, code } = req.body as {
      challengeToken?: string;
      code?: string;
    };

    if (!challengeToken)
      throw new AppError(400, "validation_error", "challengeToken is required");
    if (!code) throw new AppError(400, "validation_error", "code is required");

    // Verify and decode the short-lived challenge token.
    let sub: string;
    try {
      ({ sub } = await verifyTotpChallengeToken(challengeToken));
    } catch {
      throw new AppError(
        401,
        "invalid_token",
        "TOTP challenge token is invalid or expired",
      );
    }

    // Load identity with direct permission overrides to build token claims.
    const identity = await getIdentityWithPermissions(sub);
    if (!identity || identity.deletedAt) {
      throw new AppError(401, "invalid_token", "Identity not found");
    }

    // Guard: totpSecret must be present and TOTP must be enabled.
    if (!identity.totpEnabled || !identity.totpSecret) {
      throw new AppError(
        400,
        "totp_not_enabled",
        "TOTP is not enabled for this identity",
      );
    }

    // Verify the 6-digit code against the encrypted secret.
    const valid = verifyTotpCode(identity.totpSecret, code);
    if (!valid) {
      throw new AppError(
        401,
        "invalid_totp_code",
        "TOTP code is incorrect or expired",
      );
    }

    const claims = buildTokenClaims(identity);

    const fingerprint = generateDeviceFingerprint(
      req.headers["user-agent"] ?? "",
      req.ip ?? "",
    );

    const [accessToken, { token: refreshToken, jti: refreshJti }] =
      await Promise.all([
        signAccessToken({
          sub: identity.id,
          kind: identity.kind,
          tenantId: identity.tenantId ?? null,
          permissions: claims.permissions,
        }),
        signRefreshToken(identity.id),
      ]);

    await createRefreshToken({
      jti: refreshJti,
      identityId: identity.id,
      deviceFingerprint: fingerprint,
      userAgent: req.headers["user-agent"],
      ipAddress: req.ip,
      expiresAt: new Date(Date.now() + env.JWT_REFRESH_TTL_MS),
    });

    const isProd = env.NODE_ENV === "production";
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: env.JWT_REFRESH_TTL_MS,
    });

    res.status(200).json({ accessToken });
  } catch (error) {
    next(error);
  }
}
