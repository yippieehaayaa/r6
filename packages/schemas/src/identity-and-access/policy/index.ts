import { z } from "zod";
import {
  ListQuerySchema,
  permissionRegex,
  TenantScopedSchema,
} from "../base.schema";

// ============================================================
//  POLICY SCHEMA  (Permission Set)
//  Defines a named set of permissions that can be attached to Roles.
//  All policies are implicitly ALLOW — the system is deny-by-default,
//  so any permission not granted is already denied.
//
//  Permission string convention:  "service:resource:action"
//    e.g. "inventory:stock:read"
//         "procurement:purchase-order:approve"
// ============================================================

/** Single validated permission string */
export const PermissionSchema = z
  .string()
  .regex(
    permissionRegex,
    'Permission must follow "service:resource:action" convention (wildcards * allowed)',
  )
  .min(1, "Permission string cannot be empty");

// ── Full model ──────────────────────────────────────────────

export const PolicySchema = TenantScopedSchema.extend({
  /**
   * Unique policy name within a tenant.
   * e.g. "inventory-stock-read", "pos-cashier"
   */
  name: z
    .string()
    .min(1, "Policy name cannot be empty")
    .max(100, "Policy name must not exceed 100 characters")
    .trim(),

  /** Optional human-readable label shown in the UI */
  displayName: z
    .string()
    .max(100, "Display name must not exceed 100 characters")
    .trim()
    .nullable()
    .optional(),

  /** Optional human-readable description of what the policy does */
  description: z
    .string()
    .max(500, "Description must not exceed 500 characters")
    .trim()
    .nullable(),

  /**
   * List of permission strings this policy covers.
   * At least one permission is required.
   * e.g. ["inventory:stock:read", "inventory:stock:write"]
   */
  permissions: z
    .array(PermissionSchema)
    .min(1, "At least one permission must be specified"),

  /**
   * Whether this policy is platform-managed (seeded by the platform).
   * Managed policies cannot be edited or deleted by tenants.
   */
  isManaged: z.boolean().default(false),
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
  isManaged: true, // set only by platform seed, not by API callers
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
  isManaged: true, // not patchable via API
})
  .partial()
  .superRefine((data, ctx) => {
    // Only run when permissions are explicitly included in the patch.
    if (data.permissions) enforceReadBaseline(data.permissions, ctx);
  });

export type UpdatePolicyInput = z.infer<typeof UpdatePolicySchema>;

// ── List query params ───────────────────────────────────────

export const ListPoliciesQuerySchema = ListQuerySchema.extend({
  isManaged: z
    .union([z.literal("true"), z.literal("false")])
    .transform((v) => v === "true")
    .optional(),
});

export type ListPoliciesQuery = z.input<typeof ListPoliciesQuerySchema>;
