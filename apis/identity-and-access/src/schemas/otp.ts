import { z } from "zod";

export const generateOtpSchema = z.object({
	identityId: z.uuid(),
	purpose: z.enum([
		"REGISTRATION",
		"LOGIN",
		"PASSWORD_RESET",
		"EMAIL_VERIFICATION",
	]),
	expiresInMinutes: z.number().int().min(1).max(60).optional(),
});

export const verifyOtpSchema = z.object({
	identityId: z.uuid(),
	code: z
		.string()
		.length(6)
		.regex(/^\d{6}$/, "OTP code must be exactly 6 digits"),
	purpose: z.enum([
		"REGISTRATION",
		"LOGIN",
		"PASSWORD_RESET",
		"EMAIL_VERIFICATION",
	]),
});
