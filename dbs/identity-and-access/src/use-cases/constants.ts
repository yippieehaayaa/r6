// ============================================================
//  constants.ts
//  All domain constants for the identity-and-access service.
//  Import from here — do not declare inline in use-cases.
// ============================================================

// ─── Login / lockout ─────────────────────────────────────────

// Maximum consecutive failed login attempts before the account is locked.
export const LOGIN_MAX_ATTEMPTS = 5;

// Lock duration in milliseconds after hitting max failed attempts (15 min).
export const LOGIN_LOCK_MS = 15 * 60 * 1000;

// ─── Tenant provisioning ─────────────────────────────────────

// Platform-level policies automatically attached to the tenant-owner role
// on every new tenant. Names must match the platform tenant's seeded policies.
export const TENANT_OWNER_DEFAULT_POLICIES = [
  "iam:identity:full-access",
  "iam:role:full-access",
  "iam:policy:full-access",
] as const;

// Platform-level policies automatically attached to the tenant-admin role
// on every new tenant. Names must match the platform tenant's seeded policies.
export const TENANT_ADMIN_DEFAULT_POLICIES = [
  "iam:identity:full-access",
  "iam:role:full-access",
  "iam:policy:read-only",
] as const;
