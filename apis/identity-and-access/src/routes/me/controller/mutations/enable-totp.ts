import { activateTotp, getIdentityById } from "@r6/db-identity-and-access";
import { TotpEnableRequestSchema } from "@r6/schemas";
import { verifyTotpCode } from "@r6/totp";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../../../lib/errors";

// POST /me/totp/enable
//
// Confirms TOTP setup by verifying the first 6-digit code from the
// authenticator app. Only after successful verification does the server
// set totpEnabled = true on the identity.
//
// This two-step flow (setup → enable) prevents activating TOTP with a
// secret that was never successfully imported into the authenticator app.
//
// Guards:
//   - authMiddleware() — identity must be authenticated
//   - A pending secret must already exist (i.e. setup was called first)
//   - TOTP must not already be active

export async function enableTotp(
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> {
	try {
		const identityId = req.jwtPayload?.sub;
		if (!identityId)
			throw new AppError(401, "unauthorized", "Missing identity in token");

		const { code } = TotpEnableRequestSchema.parse(req.body);

		const identity = await getIdentityById(identityId);
		if (!identity) throw new AppError(404, "not_found", "Identity not found");

		if (identity.totpEnabled) {
			throw new AppError(
				409,
				"totp_already_enabled",
				"TOTP is already enabled.",
			);
		}

		if (!identity.totpSecret) {
			throw new AppError(
				400,
				"totp_setup_required",
				"No TOTP secret found. Call GET /me/totp/setup first.",
			);
		}

		const valid = verifyTotpCode(identity.totpSecret, code);
		if (!valid) {
			throw new AppError(
				401,
				"invalid_totp_code",
				"TOTP code is incorrect or expired. Check your authenticator app and try again.",
			);
		}

		await activateTotp(identityId, identity.tenantId);

		res.status(200).json({ message: "TOTP has been enabled successfully." });
	} catch (err) {
		next(err);
	}
}
