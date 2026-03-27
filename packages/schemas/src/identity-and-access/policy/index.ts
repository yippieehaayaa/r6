import { z } from "zod";
import {
  permissionRegex,
  serviceNameRegex,
  TenantScopedSchema,
} from "../base.schema";
import { PolicyEffectSchema } from "../enums.schema";

// ============================================================
//  POLICY SCHEMA
//  Defines what actions are allowed or denied on which resources.
//  Attached to Roles and evaluated by the API Gateway on every
//  request. DENY always takes precedence over ALLOW.
//
//  Permission string convention:  "service:resource:action"
//    e.g. "inventory:stock:read"
//         "procurement:purchase-order:approve"
//         "inventory:*:*"   ← wildcard
//
//  Audience: which microservices this policy applies to.
//    e.g. ["inventory", "procurement", "pos"]
// ============================================================

/** Single validated permission string */
export const PermissionSchema = z
  .string()
  .regex(
    permissionRegex,
    'Permission must follow "service:resource:action" convention (wildcards * allowed)',
  )
  .min(1, "Permission string cannot be empty");

/** Single validated audience / service name */
export const AudienceSchema = z
  .string()
  .regex(
    serviceNameRegex,
    "Audience entry must be a lowercase alphanumeric service name (hyphens allowed)",
  )
  .min(1, "Audience entry cannot be empty");

// ── Full model ──────────────────────────────────────────────

export const PolicySchema = TenantScopedSchema.extend({
  /**
   * Unique policy name within a tenant.
   * e.g. "inventory-full-access", "pos-cashier", "deny-warehouse-delete"
   */
  name: z
    .string()
    .min(1, "Policy name cannot be empty")
    .max(100, "Policy name must not exceed 100 characters")
    .trim(),

  /** Optional human-readable description of what the policy does */
  description: z
    .string()
    .max(500, "Description must not exceed 500 characters")
    .trim()
    .nullable(),

  /** ALLOW or DENY — DENY always wins when both effects match */
  effect: PolicyEffectSchema,

  /**
   * List of permission strings this policy covers.
   * At least one permission is required.
   * e.g. ["inventory:stock:read", "inventory:stock:write"]
   */
  permissions: z
    .array(PermissionSchema)
    .min(1, "At least one permission must be specified"),

  /**
   * Microservices this policy applies to.
   * Used by the API Gateway to scope enforcement.
   * e.g. ["inventory", "procurement"]
   */
  audience: z
    .array(AudienceSchema)
    .min(1, "At least one audience service must be specified"),

  /**
   * Optional attribute-based conditions (JSON).
   * Evaluated at the application layer per service.
   * e.g. { "warehouseId": "uuid-of-warehouse" }
   */
  conditions: z.record(z.string(), z.unknown()).nullable(),
});

export type Policy = z.infer<typeof PolicySchema>;

// ── Create payload ──────────────────────────────────────────

export const CreatePolicySchema = PolicySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

export type CreatePolicyInput = z.infer<typeof CreatePolicySchema>;

// ── Update payload ──────────────────────────────────────────

export const UpdatePolicySchema = PolicySchema.omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
}).partial();

export type UpdatePolicyInput = z.infer<typeof UpdatePolicySchema>;
