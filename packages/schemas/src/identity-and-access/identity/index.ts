import { z } from "zod";
import {
  emailRegex,
  ListQuerySchema,
  NullableTimestampSchema,
  TenantScopedSchema,
} from "../base.schema";
import { IdentityKindSchema, IdentityStatusSchema } from "../enums.schema";

// ============================================================
//  IDENTITY SCHEMA
//  Represents a human user, service account, or platform admin.
//
//  Multi-tenancy rules:
//    • tenantId is null  → ADMIN identity (platform-level)
//    • tenantId is uuid  → USER or SERVICE identity (tenant-owned)
//
//  Security note:
//    `hash` and `salt` are NEVER returned to clients. Use
//    IdentityPublicSchema / IdentitySafeSchema for API responses.
// ============================================================

/**
 * bcrypt hash pattern.
 * Matches $2a$, $2b$, or $2y$ prefixed bcrypt strings.
 */
const bcryptRegex = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

/**
 * Username rules:
 *  - 3–64 characters
 *  - Letters, digits, underscores, hyphens, dots
 *  - Must start with a letter or digit
 *  - No consecutive dots or hyphens
 */
const usernameRegex = /^[a-zA-Z0-9][a-zA-Z0-9._-]{2,63}$/;

// ── Full model (internal / DB shape) ───────────────────────

export const IdentitySchema = TenantScopedSchema.extend({
  /**
   * Human-readable login name.
   * Unique per tenant: two tenants may share the same username.
   */
  username: z
    .string()
    .regex(
      usernameRegex,
      "Username must be 3–64 alphanumeric characters (., _, - allowed; must start with a letter or digit)",
    )
    .min(3, "Username must be at least 3 characters")
    .max(64, "Username must not exceed 64 characters"),

  /**
   * Optional e-mail address.
   * Unique per tenant when present.
   * null for SERVICE accounts that don't have an inbox.
   */
  email: z
    .string()
    .regex(emailRegex, "Must be a valid e-mail address")
    .max(254, "E-mail must not exceed 254 characters")
    .toLowerCase()
    .nullable(),

  /** bcrypt hash of the password — NEVER expose to clients */
  hash: z
    .string()
    .regex(bcryptRegex, "Hash must be a valid bcrypt string ($2a$/$2b$/$2y$)"),

  /** Per-identity bcrypt salt — NEVER expose to clients */
  salt: z.string().min(1, "Salt cannot be empty"),

  /** Number of consecutive failed login attempts */
  failedLoginAttempts: z
    .number()
    .int("Must be an integer")
    .nonnegative("Cannot be negative")
    .default(0),

  /**
   * ISO 8601 — set when the account is SUSPENDED due to
   * excessive failed login attempts; null otherwise.
   */
  lockedUntil: NullableTimestampSchema,

  /** When true, the identity must set a new password on next login */
  mustChangePassword: z.boolean().default(true),

  kind: IdentityKindSchema.default("USER"),
  status: IdentityStatusSchema.default("PENDING_VERIFICATION"),
});

export type Identity = z.infer<typeof IdentitySchema>;

// ── Safe / public shape — strips sensitive fields ───────────

export const IdentitySafeSchema = IdentitySchema.omit({
  hash: true,
  salt: true,
});

export type IdentitySafe = z.infer<typeof IdentitySafeSchema>;

// ── Create payload ──────────────────────────────────────────

/**
 * plainPassword is accepted on creation and hashed by the
 * service layer before persistence. `hash` and `salt` are
 * never accepted directly from clients.
 */
export const CreateIdentitySchema = IdentitySchema.omit({
  id: true,
  // tenantId is injected from req.params.tenantId — never accepted from the body.
  tenantId: true,
  hash: true,
  salt: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  failedLoginAttempts: true,
  lockedUntil: true,
  status: true,
  // kind is overridden below to restrict to USER only.
  kind: true,
}).extend({
  /**
   * Plain-text password provided by the caller.
   * Must be at least 8 characters and include at least one
   * uppercase letter, one lowercase letter, one digit, and
   * one special character.
   */
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

  /**
   * Only USER identities may be created through the tenant-scoped route.
   * ADMIN and SERVICE identities are provisioned through separate
   * platform-level flows.
   */
  kind: z.enum(["USER"]).default("USER"),

  /**
   * When true the identity must change its password on next login.
   * Defaults to false for admin-created accounts.
   * TODO: enforce this on the login flow once first-login UX is built.
   */
  mustChangePassword: z.boolean().default(false),
});

export type CreateIdentityInput = z.infer<typeof CreateIdentitySchema>;

// ── Update payload ──────────────────────────────────────────

export const UpdateIdentitySchema = IdentitySchema.omit({
  id: true,
  tenantId: true,
  hash: true,
  salt: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
}).partial();

export type UpdateIdentityInput = z.infer<typeof UpdateIdentitySchema>;

// ── Password-change payload ─────────────────────────────────

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must not exceed 128 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/\d/, "Must contain at least one digit")
      .regex(
        /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/,
        "Must contain at least one special character",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;

// ── List query params ───────────────────────────────────────

export const ListIdentitiesQuerySchema = ListQuerySchema;

export type ListIdentitiesQuery = z.infer<typeof ListIdentitiesQuerySchema>;
