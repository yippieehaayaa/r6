import { z } from "zod";

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

  // Roles
  ROLE_READ: "iam:role:read",
  ROLE_CREATE: "iam:role:create",
  ROLE_UPDATE: "iam:role:update",
  ROLE_DELETE: "iam:role:delete",

  // Policies
  POLICY_READ: "iam:policy:read",
  POLICY_CREATE: "iam:policy:create",
  POLICY_UPDATE: "iam:policy:update",
  POLICY_DELETE: "iam:policy:delete",

  // Tenants
  TENANT_READ: "iam:tenant:read",
  TENANT_CREATE: "iam:tenant:create",
  TENANT_UPDATE: "iam:tenant:update",
  TENANT_DELETE: "iam:tenant:delete",
} as const;

export type IamPermission =
  (typeof IAM_PERMISSIONS)[keyof typeof IAM_PERMISSIONS];

// ============================================================
//  PROTECTED ROLES
//
//  These roles may only be assigned via the provision endpoint
//  (POST /tenants/:slug/provision, ADMIN-only).
//  Regular assign-role / remove-role / set-roles endpoints will
//  return 403 if a request targets one of these role names.
// ============================================================

export const PROTECTED_ROLES = ["tenant-owner", "tenant-admin"] as const;

export type ProtectedRole = (typeof PROTECTED_ROLES)[number];

/** Zod schema for the provision role field */
export const ProtectedRoleSchema = z.enum(PROTECTED_ROLES);
