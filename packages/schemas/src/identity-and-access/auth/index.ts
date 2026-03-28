import { z } from "zod";
import { emailRegex } from "../base.schema";

// ============================================================
//  AUTH SCHEMAS
//  Request / response shapes for the /auth routes.
// ============================================================

// ── Login ────────────────────────────────────────────────────

export const LoginRequestSchema = z
  .object({
    /** Login via username */
    username: z.string().min(1).optional(),
    /** Login via e-mail */
    email: z
      .string()
      .regex(emailRegex, "Must be a valid e-mail address")
      .toLowerCase()
      .optional(),
    password: z.string().min(1, "Password is required"),
    /** Resolve the tenant by UUID */
    tenantId: z.string().uuid().optional(),
    /** Resolve the tenant by URL slug */
    tenantSlug: z.string().optional(),
  })
  .refine((d) => d.username !== undefined || d.email !== undefined, {
    message: "Either username or email is required",
    path: ["username"],
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
