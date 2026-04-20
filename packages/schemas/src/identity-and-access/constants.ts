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
