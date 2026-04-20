import { z } from "zod";
import { TenantScopedSchema, UuidSchema } from "../base.schema";

// ============================================================
//  IDENTITY PERMISSION SCHEMA  (per-user permission grant)
//  Stamps a single permission directly onto one identity.
//  The system is deny-by-default: a row in this table grants the
//  permission; removing the row revokes it.
// ============================================================

/** Single concrete permission string — no wildcards allowed */
const ConcretePermissionSchema = z
  .string()
  .regex(
    /^[a-z][a-z0-9-]*:[a-z][a-z0-9-]*:[a-z][a-z0-9-]*$/,
    'Permission must follow "service:resource:action" convention (wildcards not allowed)',
  )
  .min(1, "Permission string cannot be empty");

// ── Full model ──────────────────────────────────────────────

export const IdentityPermissionSchema = TenantScopedSchema.omit({
  deletedAt: true, // grants have no soft-delete — just remove the row
}).extend({
  /** The identity this grant applies to */
  identityId: UuidSchema,

  /**
   * The exact permission string being granted.
   * No wildcards — grants must be precise.
   * e.g. "inventory:stock:delete"
   */
  permission: ConcretePermissionSchema,
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
