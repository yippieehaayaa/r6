import { getIdentityById, saveTotpSecret } from "@r6/db-identity-and-access";
import {
  encryptTotpSecret,
  generateQrDataUrl,
  generateTotpSecret,
  generateTotpUri,
} from "@r6/totp";
import type { NextFunction, Request, Response } from "express";
import { env } from "../../../../config";
import { AppError } from "../../../../lib/errors";

// GET /me/totp/setup
//
// Generates a new TOTP secret for the authenticated identity, encrypts it,
// and stores it in the DB (totpEnabled remains false until POST /me/totp/enable).
//
// Returns the plaintext secret (for manual authenticator entry), the
// otpauth:// URI, and a QR code data-URL. The plaintext secret is only
// ever returned here — the server only ever stores the AES-256-GCM form.
//
// Guards:
//   - authMiddleware() — identity must be authenticated
//   - Rejects if TOTP is already fully enabled (user must disable first)

export async function setupTotp(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const identityId = req.jwtPayload?.sub;
    if (!identityId)
      throw new AppError(401, "unauthorized", "Missing identity in token");

    const identity = await getIdentityById(identityId);
    if (!identity) throw new AppError(404, "not_found", "Identity not found");

    // Guard: do not silently regenerate a secret while TOTP is actively enabled.
    // The user must explicitly disable TOTP first.
    if (identity.totpEnabled) {
      throw new AppError(
        409,
        "totp_already_enabled",
        "TOTP is already enabled. Disable it first before setting up a new secret.",
      );
    }

    const secret = generateTotpSecret();
    const uri = generateTotpUri(secret, identity.email, env.JWT_ISSUER);
    const qrDataUrl = await generateQrDataUrl(uri);
    const encryptedSecret = encryptTotpSecret(secret);

    // Persist encrypted secret — totpEnabled stays false until activation.
    await saveTotpSecret(identityId, identity.tenantId, encryptedSecret);

    res.status(200).json({
      secret,
      uri,
      qrDataUrl,
    });
  } catch (err) {
    next(err);
  }
}
