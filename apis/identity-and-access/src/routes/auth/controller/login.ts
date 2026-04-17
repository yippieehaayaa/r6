import { createRefreshToken, verifyIdentity } from "@r6/db-identity-and-access";
import type { NextFunction, Request, Response } from "express";
import { env } from "../../../config";
import { AppError } from "../../../lib/errors";
import {
  generateDeviceFingerprint,
  signAccessToken,
  signRefreshToken,
  signTotpChallengeToken,
} from "../../../lib/jwt";
import { buildTokenClaims } from "../helpers";

export async function login(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { login, password } = req.body as {
      login?: string;
      password?: string;
    };

    if (!password)
      throw new AppError(400, "validation_error", "password is required");
    if (!login)
      throw new AppError(400, "validation_error", "login is required");

    // Parse combined identifier: "username@tenant-slug" or plain "username" (ADMIN)
    const atIndex = login.lastIndexOf("@");
    const username = atIndex === -1 ? login : login.slice(0, atIndex);
    const tenantSlug =
      atIndex === -1 ? undefined : login.slice(atIndex + 1) || undefined;

    let full: Awaited<ReturnType<typeof verifyIdentity>>;
    try {
      full = await verifyIdentity({
        tenantSlug,
        username,
        password,
      });
    } catch (e) {
      const msg = (e as Error).message;
      if (msg === "invalid_credentials")
        throw new AppError(401, "invalid_credentials", "Invalid credentials");
      if (msg.startsWith("account_locked")) {
        const lockedUntil = msg.split(":").slice(1).join(":") || undefined;
        throw new AppError(
          423,
          "account_locked",
          "Account is temporarily locked due to too many failed login attempts",
          lockedUntil ? { lockedUntil } : undefined,
        );
      }
      if (msg.startsWith("account_inactive")) {
        const status = msg.split(":")[1] || undefined;
        throw new AppError(
          403,
          "account_inactive",
          "Account is not active",
          status ? { status } : undefined,
        );
      }
      throw new AppError(
        500,
        "internal_server_error",
        "An unexpected error occurred",
      );
    }

    const claims = buildTokenClaims(full);

    // ── TOTP gate ────────────────────────────────────────────
    // If the identity has TOTP enabled, issue a short-lived challenge token
    // instead of full access/refresh tokens. The client must exchange this
    // at POST /auth/totp/verify with a valid 6-digit code.
    if (full.totpEnabled) {
      const challengeToken = await signTotpChallengeToken(full.id);
      res.status(200).json({ totpRequired: true, challengeToken });
      return;
    }

    const fingerprint = generateDeviceFingerprint(
      req.headers["user-agent"] ?? "",
      req.ip ?? "",
    );

    const [accessToken, { token: refreshToken, jti: refreshJti }] =
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
      jti: refreshJti,
      identityId: full.id,
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
