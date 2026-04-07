import { z } from "zod";

// ============================================================
//  AUTH SCHEMAS
//  Request / response shapes for the /auth routes.
// ============================================================

// ── Login ────────────────────────────────────────────────────

// Combined login identifier.
// Tenanted users: "username@tenant-slug" (e.g. "john@acme-corp")
// ADMIN users:    plain username, no "@" (e.g. "admin")
export const LoginRequestSchema = z.object({
  login: z.string().min(1, "Login is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginRequestInput = z.infer<typeof LoginRequestSchema>;

// Returned when login succeeds without TOTP (or after TOTP verification).
export const LoginSuccessResponseSchema = z.object({
  accessToken: z.string().min(1),
});

export type LoginSuccessResponse = z.infer<typeof LoginSuccessResponseSchema>;

// Returned when login succeeds but TOTP verification is required.
export const TotpChallengeResponseSchema = z.object({
  totpRequired: z.literal(true),
  challengeToken: z.string().min(1),
});

export type TotpChallengeResponse = z.infer<typeof TotpChallengeResponseSchema>;

// Union: what POST /auth/login can return.
export const LoginResponseSchema = z.union([
  LoginSuccessResponseSchema,
  TotpChallengeResponseSchema,
]);

export type LoginResponse = z.infer<typeof LoginResponseSchema>;

// ── TOTP verification ────────────────────────────────────────

export const TotpVerifyRequestSchema = z.object({
  challengeToken: z.string().min(1, "Challenge token is required"),
  code: z
    .string()
    .length(6, "TOTP code must be exactly 6 digits")
    .regex(/^\d{6}$/, "TOTP code must be 6 digits"),
});

export type TotpVerifyRequestInput = z.infer<typeof TotpVerifyRequestSchema>;

// POST /auth/totp/verify always returns an access token on success.
export const TotpVerifyResponseSchema = LoginSuccessResponseSchema;
export type TotpVerifyResponse = z.infer<typeof TotpVerifyResponseSchema>;

// ── Logout ───────────────────────────────────────────────────

export const LogoutResponseSchema = z.object({
  message: z.string(),
});

export type LogoutResponse = z.infer<typeof LogoutResponseSchema>;

// ── Refresh ──────────────────────────────────────────────────

export const RefreshResponseSchema = LoginSuccessResponseSchema;

export type RefreshResponse = z.infer<typeof RefreshResponseSchema>;
