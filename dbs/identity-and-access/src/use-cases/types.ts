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
} from "../../generated/prisma/client.js";

// ─── Re-exports for consumers ────────────────────────────────

export type { Tenant, Identity, Role, Policy };
export type { IdentityKind, IdentityStatus, PolicyEffect };

// ─── Tenant ───────────────────────────────────────────────────

// @@unique([name]), @@unique([slug])
// moduleAccess is required — must contain at least one module name.
// Financial config (costingMethod, currency, VAT) belongs to the
// Financial Service, not the tenant record.
export type CreateTenantInput = {
  name: string; // @@unique
  slug: string; // @@unique — url-safe e.g. "acme-corp"
  moduleAccess: string[]; // required — enabled microservice names
};

// Only mutable fields. name/slug uniqueness still enforced on write.
export type UpdateTenantInput = {
  name?: string;
  slug?: string;
  isActive?: boolean;
  moduleAccess?: string[];
};

// ─── Pagination ───────────────────────────────────────────────

// Shared paginated result wrapper — same shape as the listMovements pattern.
// data: the page of records, total: total matching rows,
// page: current page (1-based), limit: page size.
export type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
};

// Input for any paginated list query.
// page is 1-based. skip = (page - 1) * limit is computed internally.
export type PaginationInput = {
  page: number;
  limit: number;
};

// ─── Tenant list ──────────────────────────────────────────────

// Filters for listTenants. All optional — omitting all returns every
// non-deleted tenant. @@index([isActive]) and @@index([deletedAt])
// back these filters.
export type ListTenantsInput = PaginationInput & {
  isActive?: boolean; // filter by active/inactive
  includeDeleted?: boolean; // when true, includes soft-deleted rows
};

// ─── Identity list ────────────────────────────────────────────

// Filters for listIdentities. tenantId is required — identities are
// always scoped to a tenant. @@index([tenantId, status]) and
// @@index([tenantId, kind]) back the optional filters.
export type ListIdentitiesInput = PaginationInput & {
  tenantId: string; // required — identities are tenant-scoped
  status?: IdentityStatus; // @@index([tenantId, status])
  kind?: IdentityKind; // @@index([tenantId, kind])
};

// ─── Role list ────────────────────────────────────────────────

// Filters for listRoles. tenantId required.
// @@index([tenantId, isActive]) backs the isActive filter.
export type ListRolesInput = PaginationInput & {
  tenantId: string;
  isActive?: boolean;
};

// ─── Policy list ──────────────────────────────────────────────

// Filters for listPolicies. tenantId required.
// audience filter uses Postgres array containment: { has: service }.
export type ListPoliciesInput = PaginationInput & {
  tenantId: string;
  audience?: string; // match policies whose audience array contains this value
};

// ─── Identity ─────────────────────────────────────────────────

// @@unique([tenantId, username]), @@unique([tenantId, email])
// tenantId is null only when kind = ADMIN.
// hash + salt are required — caller is responsible for hashing.
export type CreateIdentityInput = {
  tenantId: string | null;
  username: string;
  email?: string | null;
  password: string;
  kind?: IdentityKind;
  mustChangePassword?: boolean;
};

export type VerifyIdentityInput = {
  tenantId?: string | null;
  tenantSlug?: string | null;
  username?: string;
  email?: string;
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
// tenantId null = platform role for ADMIN identities.
export type CreateRoleInput = {
  tenantId: string | null; // unique scope key
  name: string; // unique per tenantId
  description?: string | null; // was: description?: string
};

export type UpdateRoleInput = {
  name?: string;
  description?: string | null;
  isActive?: boolean;
};

// ─── Policy ───────────────────────────────────────────────────

// @@unique([tenantId, name])
// permissions and audience are required arrays — must be non-empty.
export type CreatePolicyInput = {
  tenantId: string | null; // unique scope key
  name: string; // unique per tenantId
  description?: string | null; // was: description?: string
  effect: PolicyEffect; // required — no default
  permissions: string[]; // required — convention: "service:resource:action"
  audience: string[]; // required — which services enforce this policy
  // Pass null to explicitly clear conditions.
  // Prisma.InputJsonObject is the correct concrete type for a JSON object —
  // Record<string, unknown> is not assignable to InputJsonValue.
  // The use case layer handles the null → Prisma.JsonNull conversion.
  conditions?: Record<string, unknown> | null;
};

export type UpdatePolicyInput = {
  name?: string;
  description?: string | null;
  effect?: PolicyEffect;
  permissions?: string[];
  audience?: string[];
  // Pass null to explicitly clear conditions.
  // Prisma.InputJsonObject is the correct concrete type for a JSON object.
  // The use case layer handles the null → Prisma.JsonNull conversion.
  conditions?: Record<string, unknown> | null;
};

// ─── Relation inputs ─────────────────────────────────────────

// Many-to-many: Identity ↔ Role
// Both IDs must exist and not be soft-deleted.
export type AssignRoleInput = {
  identityId: string;
  roleId: string;
};

// Many-to-many: Role ↔ Policy
// Both IDs must exist and not be soft-deleted.
export type AttachPolicyInput = {
  roleId: string;
  policyId: string;
};
