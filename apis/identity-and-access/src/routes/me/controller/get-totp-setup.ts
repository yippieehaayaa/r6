import {
  getIdentityById,
  saveTotpSecret,
} from "@r6/db-identity-and-access";
import type { NextFunction, Request, Response } from "express";
import { env } from "../../../config";
import { AppError } from "../../../lib/errors";
import {
  encryptTotpSecret,
  generateQrDataUrl,
  generateTotpSecret,
  generateTotpUri,
} from "../../../lib/totp";

export async function getTotpSetup(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (typeof req.jwtPayload?.sub !== "string") {
      throw new AppError(401, "unauthorized", "Authentication required");
    }

    const identity = await getIdentityById(req.jwtPayload.sub);
    if (!identity) {
      throw new AppError(404, "not_found", "Identity not found");
    }

    if (identity.totpEnabled) {
      throw new AppError(409, "totp_already_enabled", "TOTP is already enabled. Disable it first before re-enrolling.");
    }

    const plainSecret = generateTotpSecret();
    const encryptedSecret = encryptTotpSecret(plainSecret);

    // Persist the unverified secret. It becomes active only after enable-totp confirms the code.
    await saveTotpSecret(identity.id, encryptedSecret);

    const accountName = identity.email ?? identity.username;
    const uri = generateTotpUri(plainSecret, accountName, env.JWT_ISSUER);
    const qrCodeDataUrl = await generateQrDataUrl(uri);

    res.status(200).json({
      qrCodeDataUrl,
      manualEntryKey: plainSecret,
    });
  } catch (error) {
    next(error);
  }
}
