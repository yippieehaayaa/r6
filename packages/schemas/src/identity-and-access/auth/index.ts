import { z } from "zod";
import { emailRegex, slugRegex } from "../base.schema";
import { IdentitySafeSchema } from "../identity/index";
import { TenantSchema } from "../tenant/index";

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
// Creates a new tenant and a tenant-owner identity in one atomic operation.
// The caller becomes the owner and receives IAM access by default.
export const RegisterSchema = z.object({
  /** Company / workspace display name — e.g. "Acme Corporation" */
  companyName: z
    .string()
    .min(1, "Company name cannot be empty")
    .max(255, "Company name must not exceed 255 characters"),

  /**
   * URL-safe tenant identifier — e.g. "acme-corp".
   * Must be globally unique.
   */
  slug: z
    .string()
    .regex(
      slugRegex,
      "Slug must be lowercase alphanumeric with hyphens (e.g. acme-corp)",
    )
    .min(2, "Slug must be at least 2 characters")
    .max(63, "Slug must not exceed 63 characters"),

  /** Owner's email address — used to log in via email@slug */
  email: z
    .string()
    .regex(emailRegex, "Must be a valid e-mail address")
    .max(254, "E-mail must not exceed 254 characters")
    .toLowerCase(),

  /** Plain-text password — hashed server-side before storage */
  plainPassword: z
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

// Returned by POST /auth/register.
// Contains the new tenant and the owner identity (no secrets).
export const RegisterResponseSchema = z.object({
  tenant: TenantSchema,
  owner: IdentitySafeSchema,
});

export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;
