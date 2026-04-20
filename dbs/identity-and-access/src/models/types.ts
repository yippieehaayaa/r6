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
  IdentityPermission,
  IdentityStatus,
  Invitation,
  Policy,
  Tenant,
  TenantModule,
} from "../../generated/prisma/client.js";

// ─── Re-exports for consumers ───────────────────────────────────────────

export type { Tenant, Identity, IdentityPermission, Invitation, Policy };
export type { IdentityKind, IdentityStatus, TenantModule };

// Pagination primitives live in shared.ts — re-exported here for consumers.
import type { PaginatedResult, PaginationInput } from "./shared.js";
export type { PaginationInput, PaginatedResult };

// ─── Tenant ───────────────────────────────────────────────────

// @@unique([name]), @@unique([slug])
// ownerId is required — the owner Identity must exist before the Tenant is created.
export type CreateTenantInput = {
  name: string; // @@unique
  slug: string; // @@unique — url-safe e.g. "acme-corp"
  ownerId: string; // required — FK to Identity.id; set at creation, never back-patched
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

// @unique username (globally), @unique email (globally)
// tenantId is null for unaffiliated users (registered but not yet in a tenant)
// and for ADMIN identities. Set when the user creates or joins a tenant.
export type CreateIdentityInput = {
  tenantId?: string | null;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  country: string; // ISO 3166-1 alpha-2
  username: string;
  email: string;
  password: string;
  kind?: IdentityKind;
  mustChangePassword?: boolean;
};

// username is globally unique — no tenant context needed for verification.
export type VerifyIdentityInput = {
  username: string;
  password: string;
};

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

export type UpdateIdentityInput = {
  tenantId?: string | null; // set when user creates/joins a tenant
  firstName?: string;
  middleName?: string | null;
  lastName?: string;
  country?: string; // ISO 3166-1 alpha-2
  email?: string;
  isEmailVerified?: boolean;
  hash?: string;
  salt?: string;
  failedLoginAttempts?: number;
  lockedUntil?: Date | string | null;
  mustChangePassword?: boolean;
  status?: IdentityStatus;
};

// ─── Policy ───────────────────────────────────────────────────────

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
// ─── Relation inputs ──────────────────────────────────────────────────

// Many-to-many: Policy ↔ Invitation
// policyId must exist and not be soft-deleted. invitationId must be pending.
export type AttachPolicyToInvitationInput = {
  invitationId: string;
  policyId: string;
};
// ─── Identity Permission ──────────────────────────────────────

// Per-user permission grant — stamps a single permission directly onto an
// identity. The system is deny-by-default; removing the row revokes access.
export type CreateIdentityPermissionInput = {
  tenantId: string;
  identityId: string;
  permission: string; // "service:resource:action" — no wildcards
};

export type ListIdentityPermissionsInput = PaginationInput & {
  identityId: string;
  tenantId: string;
};

// ─── Invitation ───────────────────────────────────────────────

// Create a new invitation for a user to join a tenant.
// tenantId and invitedById are injected by the controller from JWT context.
export type CreateInvitationInput = {
  tenantId: string;
  invitedById: string;
  email: string;
  /** Raw invitation token (server-generated); stored only as SHA-256 hash */
  tokenHash: string;
  expiresAt: Date;
  /** Policy IDs to stamp as IdentityPermission ALLOW rows on accept */
  policyIds?: string[];
};

// Accept a pending invitation. Verified by looking up the token hash.
export type AcceptInvitationInput = {
  tokenHash: string; // SHA-256(rawToken from email link)
  username: string;
  password: string; // already hashed by the service layer
};

export type ListInvitationsInput = PaginationInput & {
  tenantId: string;
  /** When true, include already-accepted invitations */
  includeAccepted?: boolean;
};
