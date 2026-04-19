import { verifyPassword } from "@r6/bcrypt";
import { hmac } from "@r6/crypto";
import {
  disableTotp as disableTotpInDb,
  getIdentityById,
} from "@r6/db-identity-and-access";
import { TotpDisableRequestSchema } from "@r6/schemas";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../../../lib/errors";

// DELETE /auth/totp
//
// Disables TOTP for the authenticated identity.
//
// Requires the current account password in the request body.
// This prevents a stolen access token from silently stripping 2FA
// from the account — the attacker would also need the password.
//
// Guards:
//   - authMiddleware() — identity must be authenticated
//   - TOTP must be currently enabled
//   - Valid current password required (prevents stolen-token downgrade attack)

export async function disableTotp(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const identityId = req.jwtPayload?.sub;
    if (!identityId)
      throw new AppError(401, "unauthorized", "Missing identity in token");

    const { password } = TotpDisableRequestSchema.parse(req.body);

    const identity = await getIdentityById(identityId);
    if (!identity) throw new AppError(404, "not_found", "Identity not found");

    if (!identity.totpEnabled) {
      throw new AppError(400, "totp_not_enabled", "TOTP is not enabled.");
    }

    // Verify password — uses the same HMAC pre-processing as login.
    const valid = await verifyPassword(hmac(password), identity.hash);
    if (!valid) {
      throw new AppError(
        401,
        "invalid_credentials",
        "Current password is incorrect.",
      );
    }

    await disableTotpInDb(identityId, identity.tenantId);

    res.status(200).json({ message: "TOTP has been disabled." });
  } catch (err) {
    next(err);
  }
}
