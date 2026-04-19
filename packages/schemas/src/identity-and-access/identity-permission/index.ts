import { z } from "zod";
import { TenantScopedSchema, UuidSchema } from "../base.schema";
import { PolicyEffectSchema } from "../enums.schema";

// ============================================================
//  IDENTITY PERMISSION SCHEMA  (per-user permission override)
//  Grants or explicitly denies a single permission for one identity,
//  on top of whatever their assigned roles provide.
//
//  ALLOW — add a permission not covered by the identity's roles.
//  DENY  — remove a permission that the identity's roles would grant.
//
//  DENY always wins: applied after all role permissions are collected.
// ============================================================

/** Single concrete permission string — no wildcards allowed on overrides */
const ConcretePermissionSchema = z
  .string()
  .regex(
    /^[a-z][a-z0-9-]*:[a-z][a-z0-9-]*:[a-z][a-z0-9-]*$/,
    'Permission must follow "service:resource:action" convention (wildcards not allowed on overrides)',
  )
  .min(1, "Permission string cannot be empty");

// ── Full model ──────────────────────────────────────────────

export const IdentityPermissionSchema = TenantScopedSchema.omit({
  deletedAt: true, // overrides have no soft-delete — just remove the row
}).extend({
  /** The identity this override applies to */
  identityId: UuidSchema,

  /**
   * The exact permission string being overridden.
   * No wildcards — overrides must be precise.
   * e.g. "inventory:stock:delete"
   */
  permission: ConcretePermissionSchema,

  /**
   * ALLOW — grant this permission on top of the identity's roles.
   * DENY  — block this permission even if the identity's roles grant it.
   */
  effect: PolicyEffectSchema,
});

export type IdentityPermission = z.infer<typeof IdentityPermissionSchema>;

// ── Create payload ──────────────────────────────────────────

export const CreateIdentityPermissionSchema = IdentityPermissionSchema.omit({
  id: true,
  tenantId: true, // inferred from route context
  createdAt: true,
  updatedAt: true,
});

export type CreateIdentityPermissionInput = z.infer<
  typeof CreateIdentityPermissionSchema
>;

// ── List query params ───────────────────────────────────────

import { ListQuerySchema } from "../base.schema";

export const ListIdentityPermissionsQuerySchema = ListQuerySchema;

export type ListIdentityPermissionsQuery = z.input<
  typeof ListIdentityPermissionsQuerySchema
>;

// ── Update payload ──────────────────────────────────────────

/** Only the effect can be changed on an existing override */
export const UpdateIdentityPermissionSchema = z.object({
  effect: PolicyEffectSchema,
});

export type UpdateIdentityPermissionInput = z.infer<
  typeof UpdateIdentityPermissionSchema
>;
