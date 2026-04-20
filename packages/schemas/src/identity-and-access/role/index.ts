import { z } from "zod";
import {
  ListQuerySchema,
  TenantScopedSchema,
  UuidSchema,
} from "../base.schema";

// ============================================================
//  ROLE SCHEMA
//  A named collection of policies assigned to identities.
//  Roles are tenant-scoped; tenantId = null is reserved for
//  platform-level roles attached to ADMIN identities only.
// ============================================================

export const RoleSchema = TenantScopedSchema.extend({
  /**
   * Display name for the role.
   * Unique per tenant.
   * e.g. "Warehouse Manager", "Cashier", "Finance Viewer"
   */
  name: z
    .string()
    .min(1, "Role name cannot be empty")
    .max(100, "Role name must not exceed 100 characters")
    .trim(),

  /** Optional human-readable label shown in the UI */
  displayName: z
    .string()
    .max(100, "Display name must not exceed 100 characters")
    .trim()
    .nullable()
    .optional(),

  /** Optional human-readable description of the role's purpose */
  description: z
    .string()
    .max(500, "Description must not exceed 500 characters")
    .trim()
    .nullable(),

  /** Whether this role is currently active and can be assigned */
  isActive: z.boolean().default(true),

  /**
   * Whether this role is platform-managed (seeded by the platform).
   * Managed roles cannot be edited or deleted by tenants.
   */
  isManaged: z.boolean().default(false),
});

export type Role = z.infer<typeof RoleSchema>;

// ── Create payload ──────────────────────────────────────────

export const CreateRoleSchema = RoleSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  isActive: true, // defaults to true
  isManaged: true, // set only by platform seed, not by API callers
});

export type CreateRoleInput = z.infer<typeof CreateRoleSchema>;

// ── Update payload ──────────────────────────────────────────

export const UpdateRoleSchema = RoleSchema.omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  isManaged: true, // not patchable via API
}).partial();

export type UpdateRoleInput = z.infer<typeof UpdateRoleSchema>;

// ── Policy assignment payload ───────────────────────────────

export const AssignPoliciesToRoleSchema = z.object({
  /** UUIDs of policies to attach to (or detach from) the role */
  policyIds: z
    .array(UuidSchema)
    .min(1, "At least one policy ID must be provided"),
});

export type AssignPoliciesToRoleInput = z.infer<
  typeof AssignPoliciesToRoleSchema
>;

// ── List query params ───────────────────────────────────────

export const ListRolesQuerySchema = ListQuerySchema;

export type ListRolesQuery = z.input<typeof ListRolesQuerySchema>;
