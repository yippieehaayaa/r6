import { z } from "zod";
import {
  ListQuerySchema,
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

// ============================================================
//  PERMISSION HIERARCHY: Read-as-Baseline
//
//  Rule: within the same "service:resource" namespace, each of
//  create / update / delete independently requires "read" to
//  also appear in the same permissions list.
//
//  Wildcards (*) implicitly cover read and bypass the check.
//  e.g. "inventory:stock:*" or "inventory:*:*" → always valid.
//
//  Applied at the *payload* level (Create / Update) so that
//  PolicySchema itself stays a clean data-shape with no
//  cross-field side effects. All violations are collected
//  before returning so every missing read surfaces at once.
// ============================================================

const WRITE_ACTIONS = new Set(["create", "update", "delete"]);

function enforceReadBaseline(
  permissions: string[],
  ctx: z.RefinementCtx,
): void {
  // Wildcards implicitly include read — exclude them from the check.
  const concrete = permissions.filter((p) => !p.includes("*"));

  // Group actions by their "service:resource" namespace.
  const byNamespace = new Map<string, Set<string>>();
  for (const perm of concrete) {
    const parts = perm.split(":");
    if (parts.length !== 3) continue; // format violations caught by PermissionSchema
    const ns = `${parts[0]}:${parts[1]}`;
    const action = parts[2];
    if (!action) continue;
    const existing = byNamespace.get(ns);
    if (existing) {
      existing.add(action);
    } else {
      byNamespace.set(ns, new Set([action]));
    }
  }

  // Emit one issue per write action missing its read baseline.
  for (const [ns, actions] of byNamespace) {
    if (actions.has("read")) continue;
    for (const action of actions) {
      if (!WRITE_ACTIONS.has(action)) continue;
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["permissions"],
        message: `"${ns}:read" must be included when granting write access to "${ns}"`,
      });
    }
  }
}

// ── Create payload ──────────────────────────────────────────

export const CreatePolicySchema = PolicySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
}).superRefine((data, ctx) => {
  enforceReadBaseline(data.permissions, ctx);
});

export type CreatePolicyInput = z.infer<typeof CreatePolicySchema>;

// ── Update payload ──────────────────────────────────────────

export const UpdatePolicySchema = PolicySchema.omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
})
  .partial()
  .superRefine((data, ctx) => {
    // Only run when permissions are explicitly included in the patch.
    if (data.permissions) enforceReadBaseline(data.permissions, ctx);
  });

export type UpdatePolicyInput = z.infer<typeof UpdatePolicySchema>;

// ── List query params ───────────────────────────────────────

export const ListPoliciesQuerySchema = ListQuerySchema;

export type ListPoliciesQuery = z.infer<typeof ListPoliciesQuerySchema>;
