// ============================================================
//  IAM PERMISSION STRINGS — single source of truth
//
//  Convention: "service:resource:action"
//  Used in:
//    - API route guards: requirePermission(IAM_PERMISSIONS.*)
//    - JWT permission arrays in the API layer
//    - Frontend hasPermission(IAM_PERMISSIONS.*) checks
//    - Seed policies (by value)
// ============================================================

export const IAM_PERMISSIONS = {
  // Identities
  IDENTITY_READ: "iam:identity:read",
  IDENTITY_CREATE: "iam:identity:create",
  IDENTITY_UPDATE: "iam:identity:update",
  IDENTITY_DELETE: "iam:identity:delete",
  IDENTITY_RESTORE: "iam:identity:restore",

  // Roles
  ROLE_READ: "iam:role:read",
  ROLE_CREATE: "iam:role:create",
  ROLE_UPDATE: "iam:role:update",
  ROLE_DELETE: "iam:role:delete",
  ROLE_RESTORE: "iam:role:restore",

  // Policies
  POLICY_READ: "iam:policy:read",
  POLICY_CREATE: "iam:policy:create",
  POLICY_UPDATE: "iam:policy:update",
  POLICY_DELETE: "iam:policy:delete",
  POLICY_RESTORE: "iam:policy:restore",

  // Tenants
  TENANT_READ: "iam:tenant:read",
  TENANT_CREATE: "iam:tenant:create",
  TENANT_UPDATE: "iam:tenant:update",
  TENANT_DELETE: "iam:tenant:delete",
  TENANT_RESTORE: "iam:tenant:restore",
} as const;

export type IamPermission =
  (typeof IAM_PERMISSIONS)[keyof typeof IAM_PERMISSIONS];

// ── Protected role slugs ─────────────────────────────────────────────────────
// These roles are seeded by the platform and cannot be created or deleted by
// API callers. tenant-owner is bootstrapped at tenant-creation time.
// tenant-admin is the only role provisionable via POST /tenants/:id/provision.
export const PROTECTED_ROLES = ["tenant-owner", "tenant-admin"] as const;
export type ProtectedRole = (typeof PROTECTED_ROLES)[number];
