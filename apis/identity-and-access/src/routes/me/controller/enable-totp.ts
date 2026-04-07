import { activateTotp, getIdentityById } from "@r6/db-identity-and-access";
import { TotpEnableRequestSchema } from "@r6/schemas/identity-and-access";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../../lib/errors";
import { verifyTotpCode } from "../../../lib/totp";

export async function enableTotp(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (typeof req.jwtPayload?.sub !== "string") {
      throw new AppError(401, "unauthorized", "Authentication required");
    }

    const { code } = TotpEnableRequestSchema.parse(req.body);

    const identity = await getIdentityById(req.jwtPayload.sub);
    if (!identity) {
      throw new AppError(404, "not_found", "Identity not found");
    }

    if (identity.totpEnabled) {
      throw new AppError(
        409,
        "totp_already_enabled",
        "TOTP is already enabled for this identity",
      );
    }

    if (!identity.totpSecret) {
      throw new AppError(
        400,
        "totp_setup_required",
        "Call GET /me/totp/setup first to generate a secret",
      );
    }

    const valid = verifyTotpCode(identity.totpSecret, code);
    if (!valid) {
      throw new AppError(
        401,
        "invalid_totp_code",
        "TOTP code is incorrect or expired",
      );
    }

    await activateTotp(identity.id);

    res.status(200).json({ message: "TOTP enabled successfully" });
  } catch (error) {
    next(error);
  }
}
