import { z } from "zod";
import { emailRegex } from "../base.schema";
import { IdentitySafeSchema } from "../identity/index";

// ============================================================
//  AUTH SCHEMAS
//  Request / response shapes for the /auth routes.
// ============================================================

// ── Login ────────────────────────────────────────────────────

// Combined login identifier.
export const LoginRequestSchema = z.object({
  username: z.string().min(1, "Username is required"),
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

// ── Sessions ─────────────────────────────────────────────────

export const SessionSchema = z.object({
  jti: z.string(),
  userAgent: z.string().nullable(),
  ipAddress: z.string().nullable(),
  expiresAt: z.coerce.date(),
  createdAt: z.coerce.date(),
});

export type Session = z.infer<typeof SessionSchema>;

export const SessionsResponseSchema = z.array(SessionSchema);

export type SessionsResponse = z.infer<typeof SessionsResponseSchema>;

// ── Registration ─────────────────────────────────────────────

// Used by POST /auth/register (public — no auth required).
// Creates an unaffiliated identity; tenant creation is a separate step.
export const RegisterSchema = z.object({
  // ── Personal info ────────────────────────────────────────

  /** Legal first name */
  firstName: z
    .string()
    .trim()
    .min(1, "First name cannot be empty")
    .max(100, "First name must not exceed 100 characters"),

  /** Legal middle name — optional */
  middleName: z
    .string()
    .trim()
    .min(1, "Middle name cannot be empty")
    .max(100, "Middle name must not exceed 100 characters")
    .optional(),

  /** Legal last name */
  lastName: z
    .string()
    .trim()
    .min(1, "Last name cannot be empty")
    .max(100, "Last name must not exceed 100 characters"),

  /**
   * ISO 3166-1 alpha-2 country code — 2 uppercase letters.
   * e.g. "PH" (Philippines), "US" (United States), "GB" (United Kingdom)
   */
  country: z
    .string()
    .length(2, "Country must be a 2-letter ISO 3166-1 alpha-2 code")
    .regex(/^[A-Z]{2}$/, "Country must be uppercase letters (e.g. PH, US, GB)")
    .toUpperCase(),

  // ── Account ──────────────────────────────────────────────

  /**
   * Globally unique login name.
   * Letters, digits, underscores, hyphens, dots allowed.
   * Must start with a letter or digit.
   */
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(64, "Username must not exceed 64 characters")
    .regex(
      /^[a-zA-Z0-9][a-zA-Z0-9._-]{2,63}$/,
      "Username must be 3–64 alphanumeric characters (., _, - allowed; must start with a letter or digit)",
    ),

  /** Owner's email address — globally unique */
  email: z
    .string()
    .regex(emailRegex, "Must be a valid e-mail address")
    .max(254, "E-mail must not exceed 254 characters")
    .toLowerCase(),

  /** Plain-text password — hashed server-side before storage */
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must not exceed 128 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one digit")
    .regex(
      /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/,
      "Password must contain at least one special character",
    ),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

// Returned by POST /auth/register — just a message; no identity returned
// until the email is verified.
export const RegisterResponseSchema = z.object({
  message: z.string(),
});

export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;

// ── Email verification ────────────────────────────────────────

// Used by POST /auth/register/verify-email (public — no auth required).
// Submits the 6-digit OTP that was emailed to the registrant.
export const VerifyEmailRequestSchema = z.object({
  /** The email address that was used during registration */
  email: z
    .string()
    .regex(emailRegex, "Must be a valid e-mail address")
    .max(254, "E-mail must not exceed 254 characters")
    .toLowerCase(),

  /** 6-digit numeric OTP sent to the registrant's email */
  code: z
    .string()
    .length(6, "Verification code must be exactly 6 digits")
    .regex(/^\d{6}$/, "Verification code must be 6 digits"),
});

export type VerifyEmailRequestInput = z.infer<typeof VerifyEmailRequestSchema>;

// Returned by POST /auth/register/verify-email on success.
// Returns the now-active identity (no tenant yet — tenant creation is separate).
export const VerifyEmailResponseSchema = z.object({
  owner: IdentitySafeSchema,
});

export type VerifyEmailResponse = z.infer<typeof VerifyEmailResponseSchema>;
