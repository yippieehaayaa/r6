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
  Prisma,
  Role,
  Tenant,
} from "../../generated/prisma/client";

// ─── Re-exports for consumers ────────────────────────────────

export type { Tenant, Identity, Role, Policy };
export type { IdentityKind, IdentityStatus, PolicyEffect };

// ─── Tenant ───────────────────────────────────────────────────

// @@unique([name]), @@unique([slug])
// All fields except isActive, moduleAccess, costingMethod,
// defaultCurrency, vatRegistered are required on create.
export type CreateTenantInput = {
  name: string; // @@unique
  slug: string; // @@unique — url-safe e.g. "acme-corp"
  moduleAccess: string[]; // required — at least one module
  costingMethod?: string; // default "FIFO"
  defaultCurrency?: string; // default "PHP"
  vatRegistered?: boolean; // default false
  vatNumber?: string;
};

// Only mutable fields. name/slug uniqueness still enforced on write.
export type UpdateTenantInput = {
  name?: string;
  slug?: string;
  isActive?: boolean;
  moduleAccess?: string[];
  costingMethod?: string;
  defaultCurrency?: string;
  vatRegistered?: boolean;
  vatNumber?: string | null;
};

// ─── Identity ─────────────────────────────────────────────────

// @@unique([tenantId, username]), @@unique([tenantId, email])
// tenantId is null only when kind = ADMIN.
// hash + salt are required — caller is responsible for hashing.
export type CreateIdentityInput = {
  tenantId: string | null; // null for ADMIN, required for USER/SERVICE
  username: string; // unique per tenantId
  email?: string; // unique per tenantId when provided
  hash: string; // pre-hashed password
  salt: string; // per-identity salt
  kind?: IdentityKind; // default USER
  mustChangePassword?: boolean; // default true
};

export type UpdateIdentityInput = {
  email?: string | null;
  hash?: string;
  salt?: string;
  failedLoginAttempts?: number;
  lockedUntil?: Date | null;
  mustChangePassword?: boolean;
  status?: IdentityStatus;
};

// ─── Role ─────────────────────────────────────────────────────

// @@unique([tenantId, name])
// tenantId null = platform role for ADMIN identities.
export type CreateRoleInput = {
  tenantId: string | null; // unique scope key
  name: string; // unique per tenantId
  description?: string;
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
  description?: string;
  effect: PolicyEffect; // required — no default
  permissions: string[]; // required — convention: "service:resource:action"
  audience: string[]; // required — which services enforce this policy
  // Pass null to explicitly clear conditions.
  // Prisma.InputJsonObject is the correct concrete type for a JSON object —
  // Record<string, unknown> is not assignable to InputJsonValue.
  // The use case layer handles the null → Prisma.JsonNull conversion.
  conditions?: Prisma.InputJsonObject | null;
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
  conditions?: Prisma.InputJsonObject | null;
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
