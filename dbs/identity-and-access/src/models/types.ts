// ============================================================
//  types.ts
//  Input / output shapes derived strictly from schema
//  constraints: unique indexes, FK relations, required fields,
//  defaults, and referential actions.
//
//  No business logic, validation rules, or auth here.
// ============================================================

import type {
  Identity,
  IdentityKind,
  IdentityStatus,
  Policy,
  PolicyEffect,
  Role,
  Tenant,
  TenantModule,
} from "../../generated/prisma/client.js";
// IdentityPermission type is available after running: prisma migrate dev
// import type { IdentityPermission } from "../../generated/prisma/client.js";

// ─── Re-exports for consumers ───────────────────────────────

export type { Tenant, Identity, Role, Policy };
export type { IdentityKind, IdentityStatus, PolicyEffect, TenantModule };

// Pagination primitives live in shared.ts — re-exported here for consumers.
import type { PaginatedResult, PaginationInput } from "./shared.js";
export type { PaginationInput, PaginatedResult };

// ─── Tenant ───────────────────────────────────────────────────

// @@unique([name]), @@unique([slug])
// moduleAccess is required — must contain at least one module name.
export type CreateTenantInput = {
  name: string; // @@unique
  slug: string; // @@unique — url-safe e.g. "acme-corp"
  moduleAccess: TenantModule[]; // required — enabled microservice modules
};

// Only mutable fields. name/slug uniqueness still enforced on write.
export type UpdateTenantInput = {
  name?: string;
  slug?: string;
  isActive?: boolean;
  moduleAccess?: TenantModule[];
};

// ─── Tenant list ──────────────────────────────────────────────

// Filters for listTenants. All optional — omitting all returns every
// non-deleted tenant. @@index([isActive]) and @@index([deletedAt])
// back these filters.
// search performs a case-insensitive OR match on name and slug.
export type ListTenantsInput = PaginationInput & {
  isActive?: boolean; // filter by active/inactive
  includeDeleted?: boolean; // when true, includes soft-deleted rows
  search?: string; // case-insensitive OR filter on name + slug
};

// ─── Identity list ────────────────────────────────────────────

// Filters for listIdentities. tenantId is required — identities are
// always scoped to a tenant. @@index([tenantId, status]) and
// @@index([tenantId, kind]) back the optional filters.
// search performs a case-insensitive OR match on username and email.
export type ListIdentitiesInput = PaginationInput & {
  tenantId: string; // required — identities are tenant-scoped
  status?: IdentityStatus; // @@index([tenantId, status])
  kind?: IdentityKind; // @@index([tenantId, kind])
  search?: string; // case-insensitive OR filter on username + email
};

// ─── Role list ────────────────────────────────────────────────

// Filters for listRoles. tenantId required.
// @@index([tenantId, isActive]) backs the isActive filter.
// search performs a case-insensitive OR match on name, displayName, and description.
export type ListRolesInput = PaginationInput & {
  tenantId: string;
  isActive?: boolean;
  search?: string; // case-insensitive OR filter on name + displayName + description
};

// ─── Policy list ──────────────────────────────────────────────

// Filters for listPolicies. tenantId is required — policies are tenant-scoped.
// isManaged filters platform-seeded (true) vs. tenant-created (false) policies.
// search performs a case-insensitive OR match on name, displayName, and description.
export type ListPoliciesInput = PaginationInput & {
  tenantId: string; // required — policies are tenant-scoped
  isManaged?: boolean; // filter platform-seeded (true) vs. tenant-created (false)
  search?: string; // case-insensitive OR filter on name + displayName + description
};

// ─── Identity ─────────────────────────────────────────────────

// @@unique([tenantId, username]), @@unique([tenantId, email])
// All identities belong to a tenant.
export type CreateIdentityInput = {
  tenantId: string; // required — always tenant-scoped
  username: string;
  email?: string | null;
  password: string;
  kind?: IdentityKind;
  mustChangePassword?: boolean;
};

// tenantId or tenantSlug must be provided — there is no admin login path.
export type VerifyIdentityInput = {
  tenantId?: string;
  tenantSlug?: string;
  username: string; // always required
  password: string;
};

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

export type UpdateIdentityInput = {
  email?: string | null;
  hash?: string;
  salt?: string;
  failedLoginAttempts?: number;
  lockedUntil?: Date | string | null;
  mustChangePassword?: boolean;
  status?: IdentityStatus;
};

// ─── Role ─────────────────────────────────────────────────────

// @@unique([tenantId, name])
// All roles belong to a tenant.
export type CreateRoleInput = {
  tenantId: string; // required — always tenant-scoped
  name: string; // unique per tenantId
  displayName?: string | null; // human-readable label shown in the UI
  description?: string | null;
  isManaged?: boolean; // true = platform-seeded, tenants cannot edit/delete
};

export type UpdateRoleInput = {
  name?: string;
  displayName?: string | null;
  description?: string | null;
  isActive?: boolean;
};

// ─── Policy ───────────────────────────────────────────────────

// @@unique([tenantId, name])
// All policies belong to a tenant.
// All policies are implicitly ALLOW — the system is deny-by-default.
// Per-user DENY overrides live on IdentityPermission, not here.
export type CreatePolicyInput = {
  tenantId: string; // required — always tenant-scoped
  name: string; // unique per tenantId
  displayName?: string | null; // human-readable label shown in the UI
  description?: string | null;
  permissions: string[]; // required — convention: "service:resource:action"
  isManaged?: boolean; // true = platform-seeded, tenants cannot edit/delete
};

export type UpdatePolicyInput = {
  name?: string;
  displayName?: string | null;
  description?: string | null;
  permissions?: string[];
};

// ─── Relation inputs ─────────────────────────────────────────

// Many-to-many: Identity ↔ Role
// Both IDs must exist and not be soft-deleted.
export type AssignRoleInput = {
  tenantId: string; // required — verifies identity belongs to tenant before join insert
  identityId: string;
  roleId: string;
};

// Many-to-many: Role ↔ Policy
// Both IDs must exist and not be soft-deleted.
export type AttachPolicyInput = {
  tenantId: string; // required — verifies role belongs to tenant before join insert
  roleId: string;
  policyId: string;
};

// ─── Identity Permission ──────────────────────────────────────

// Per-user permission override — grants or explicitly denies a single
// permission for one identity on top of their role-derived permissions.
export type CreateIdentityPermissionInput = {
  tenantId: string;
  identityId: string;
  permission: string; // "service:resource:action" — no wildcards
  effect: PolicyEffect; // ALLOW to add, DENY to remove
};

export type UpdateIdentityPermissionInput = {
  effect: PolicyEffect;
};

export type ListIdentityPermissionsInput = PaginationInput & {
  identityId: string;
  tenantId: string;
};
