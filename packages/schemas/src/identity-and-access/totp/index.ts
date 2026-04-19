import { z } from "zod";

// ============================================================
//  TOTP SCHEMAS — @r6/schemas/identity-and-access/totp
//
//  Request / response shapes for the /me/totp routes.
//
//  Flow:
//    1. GET  /me/totp/setup   → generate secret, return QR + URI + secret
//    2. POST /me/totp/enable  → confirm first code → mark totpEnabled = true
//    3. DELETE /me/totp       → verify current password → disable TOTP
// ============================================================

// ── Shared: 6-digit TOTP code ─────────────────────────────────

export const TotpCodeSchema = z
  .string()
  .length(6, "TOTP code must be exactly 6 digits")
  .regex(/^\d{6}$/, "TOTP code must consist of 6 digits");

export type TotpCode = z.infer<typeof TotpCodeSchema>;

// ── GET /me/totp/setup ────────────────────────────────────────
//  No request body — the identity is inferred from the JWT.
//  Generates a new encrypted secret, persists it (totpEnabled stays false),
//  and returns the data needed to enroll in an authenticator app.

export const TotpSetupResponseSchema = z.object({
  /**
   * Plaintext Base32 TOTP secret — shown once for manual authenticator entry.
   * The server only ever stores the AES-256-GCM-encrypted form.
   */
  secret: z.string().min(1),

  /**
   * otpauth:// provisioning URI — scan this with an authenticator app.
   */
  uri: z.string().min(1),

  /**
   * PNG QR code as a base64 data-URL (data:image/png;base64,…).
   * Embed directly in an <img> tag.
   */
  qrDataUrl: z.string().min(1),
});

export type TotpSetupResponse = z.infer<typeof TotpSetupResponseSchema>;

// ── POST /me/totp/enable ──────────────────────────────────────
//  Confirms setup by verifying the first code from the authenticator app.
//  Sets totpEnabled = true only on successful verification.

export const TotpEnableRequestSchema = z.object({
  code: TotpCodeSchema,
});

export type TotpEnableRequestInput = z.infer<typeof TotpEnableRequestSchema>;

export const TotpEnableResponseSchema = z.object({
  message: z.string(),
});

export type TotpEnableResponse = z.infer<typeof TotpEnableResponseSchema>;

// ── DELETE /me/totp ───────────────────────────────────────────
//  Requires the current account password so a stolen access token cannot
//  silently strip 2FA from the account (downgrade-attack prevention).

export const TotpDisableRequestSchema = z.object({
  password: z.string().min(1, "Current password is required"),
});

export type TotpDisableRequestInput = z.infer<typeof TotpDisableRequestSchema>;

export const TotpDisableResponseSchema = z.object({
  message: z.string(),
});

export type TotpDisableResponse = z.infer<typeof TotpDisableResponseSchema>;
