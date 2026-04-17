import { z } from "zod";
import {
  emailRegex,
  ListQuerySchema,
  NullableTimestampSchema,
  TimestampSchema,
  UuidSchema,
} from "../base.schema";

// ============================================================
//  INVITATION SCHEMA
//  Represents a pending email invitation sent to a user to join
//  a tenant. Single-use and time-limited.
//
//  tokenHash is the SHA-256 hash of the raw email token — never
//  send the hash to clients; use InvitationSafeSchema instead.
// ============================================================

export const InvitationSchema = z.object({
  id: UuidSchema,
  tenantId: UuidSchema,
  email: z.string().regex(emailRegex).max(254).toLowerCase(),
  /** SHA-256 hash of the raw invitation token — internal use only */
  tokenHash: z.string().min(1),
  roleId: UuidSchema.nullable(),
  invitedById: UuidSchema,
  expiresAt: TimestampSchema,
  acceptedAt: NullableTimestampSchema,
  createdAt: TimestampSchema,
});
export type Invitation = z.infer<typeof InvitationSchema>;

// ── Safe view (client-facing) ─────────────────────────────────
// Omits tokenHash — the hash is never sent over the wire.

export const InvitationSafeSchema = InvitationSchema.omit({ tokenHash: true });
export type InvitationSafe = z.infer<typeof InvitationSafeSchema>;

// ── Create payload ────────────────────────────────────────────
// tenantId and invitedById are injected from the JWT context in
// the controller — they must not be provided by the caller.

export const CreateInvitationSchema = z.object({
  email: z
    .string()
    .regex(emailRegex, "Must be a valid email address")
    .max(254)
    .toLowerCase(),
  /** Optional role to automatically assign when the invitation is accepted */
  roleId: UuidSchema.optional(),
});
export type CreateInvitationInput = z.infer<typeof CreateInvitationSchema>;

// ── Accept payload ────────────────────────────────────────────
// The raw token from the email link is verified server-side; it is
// never stored. No wildcards — password must meet full strength rules.

export const AcceptInvitationSchema = z
  .object({
    /** Raw invitation token from the email link */
    token: z.string().min(1, "Invitation token is required"),
    username: z
      .string()
      .regex(
        /^[a-zA-Z0-9][a-zA-Z0-9._-]{2,63}$/,
        "Username must be 3–64 characters and may contain letters, digits, dots, underscores, and hyphens",
      ),
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
    confirmPassword: z.string(),
  })
  .refine((d) => d.plainPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type AcceptInvitationInput = z.infer<typeof AcceptInvitationSchema>;

// ── List query ────────────────────────────────────────────────

export const ListInvitationsQuerySchema = ListQuerySchema.extend({
  /** When true, includes already-accepted invitations */
  includeAccepted: z.coerce.boolean().optional(),
});
export type ListInvitationsQuery = z.input<typeof ListInvitationsQuerySchema>;
