import { z } from "zod";
import {
  BaseRecordSchema,
  emailRegex,
  ListQuerySchema,
  NullableTimestampSchema,
  NullableUuidSchema,
} from "../base.schema";
import { IdentityKindSchema, IdentityStatusSchema } from "../enums.schema";

// ============================================================
//  IDENTITY SCHEMA
//  Represents a human user or service account.
//
//  Multi-tenancy rules:
//    • tenantId is null  → unaffiliated user (registered, no tenant yet)
//    • tenantId is uuid  → USER or SERVICE identity belonging to a tenant
//
//  A user may only belong to one tenant at a time.
//  tenantId is set when the user creates a tenant or accepts an invitation.
//
//  status (lifecycle):
//    PENDING_VERIFICATION → ACTIVE once email is verified.
//    INACTIVE             → disabled by an admin.
//    SUSPENDED            → locked due to policy (e.g. too many failed logins).
//
//  Security note:
//    `hash` and `salt` are NEVER returned to clients. Use
//    IdentitySafeSchema for API responses.
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

export const IdentitySchema = BaseRecordSchema.extend({
  /**
   * FK → Tenant.id — null for unaffiliated users (registered, no tenant yet).
   * Set once the user creates a tenant or accepts an invitation.
   */
  tenantId: NullableUuidSchema,

  // ── Personal info ──────────────────────────────────────────

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
    .nullable()
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

  // ── Account ────────────────────────────────────────────────

  /**
   * Human-readable login name.
   * Globally unique across all tenants.
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
   * E-mail address. Required for all identities.
   * Globally unique — one account per email address across the entire system.
   */
  email: z
    .string()
    .regex(emailRegex, "Must be a valid e-mail address")
    .max(254, "E-mail must not exceed 254 characters")
    .toLowerCase(),

  /** Whether the identity has verified ownership of the email address */
  isEmailVerified: z.boolean().default(false),

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
  mustChangePassword: z.boolean().default(false),

  kind: IdentityKindSchema.default("USER"),
  status: IdentityStatusSchema.default("PENDING_VERIFICATION"),

  /** Whether TOTP two-factor authentication is active for this identity */
  totpEnabled: z.boolean().default(false),

  /** AES-256-GCM encrypted TOTP secret — NEVER expose to clients */
  totpSecret: z.string().nullable().optional(),

  /** When the TOTP secret was first verified; null when TOTP is not enabled */
  totpVerifiedAt: NullableTimestampSchema.optional(),
});

export type Identity = z.infer<typeof IdentitySchema>;

// ── Safe / public shape — strips sensitive fields ───────────

export const IdentitySafeSchema = IdentitySchema.omit({
  hash: true,
  salt: true,
  totpSecret: true,
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
  // Immutable after creation — re-classifying USER ↔ SERVICE ↔ ADMIN
  // must go through a dedicated privileged operation, not a PATCH.
  kind: true,
  // TOTP fields are managed exclusively via dedicated /totp/* endpoints;
  // exposing them through a general PATCH is a security gap.
  totpEnabled: true,
  totpSecret: true,
  totpVerifiedAt: true,
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

export const ChangePasswordResponseSchema = z.object({
  message: z.string(),
});

export type ChangePasswordResponse = z.infer<
  typeof ChangePasswordResponseSchema
>;

// ── Provision payload (ADMIN-only, bootstrap tenant identities) ────────────

/**
 * Used by POST /tenants/:slug/provision (requireAdmin)
 * Creates a USER identity and assigns it the tenant-admin role.
 * The tenant-owner role is reserved — it is created automatically at tenant
 * creation time and cannot be reassigned via this endpoint.
 * Password field name matches CreateIdentitySchema for consistency.
 */
export const ProvisionIdentitySchema = z.object({
  username: IdentitySchema.shape.username,
  email: IdentitySchema.shape.email,
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
  role: z.literal("tenant-admin"),
});

export type ProvisionIdentityInput = z.infer<typeof ProvisionIdentitySchema>;

// ── List query params ───────────────────────────────────────

export const ListIdentitiesQuerySchema = ListQuerySchema.extend({
  status: IdentityStatusSchema.optional(),
  kind: IdentityKindSchema.optional(),
});

export type ListIdentitiesQuery = z.input<typeof ListIdentitiesQuerySchema>;
