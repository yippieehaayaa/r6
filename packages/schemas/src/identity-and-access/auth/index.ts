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

export const LoginResponseSchema = z.object({
  accessToken: z.string().min(1),
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;

// ── Logout ───────────────────────────────────────────────────

export const LogoutResponseSchema = z.object({
  message: z.string(),
});

export type LogoutResponse = z.infer<typeof LogoutResponseSchema>;

// ── Refresh ──────────────────────────────────────────────────

export const RefreshResponseSchema = LoginResponseSchema;

export type RefreshResponse = z.infer<typeof RefreshResponseSchema>;
