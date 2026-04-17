// ============================================================
//  constants.ts
//  Business-rule constants for the identity-and-access API.
//
//  These live in the API layer (not the db layer) because they
//  are policy decisions: which permissions a role gets by default
//  is an application concern, not a database concern.
// ============================================================

// ─── Tenant provisioning ─────────────────────────────────────

// Platform-level policies (tenantId = null) attached to the tenant-owner
// role on every new tenant. Names must match the platform seed policies.
export const TENANT_OWNER_DEFAULT_POLICIES = [
	"iam:identity:full-access",
	"iam:role:full-access",
	"iam:policy:full-access",
] as const;

// Platform-level policies attached to the tenant-admin role on every
// new tenant. Names must match the platform seed policies.
export const TENANT_ADMIN_DEFAULT_POLICIES = [
	"iam:identity:full-access",
	"iam:role:full-access",
	"iam:policy:read-only",
] as const;
