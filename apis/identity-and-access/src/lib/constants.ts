// ============================================================
//  constants.ts
//  Business-rule constants for the identity-and-access API.
//
//  These live in the API layer (not the db layer) because they
//  are policy decisions: which permissions a role gets by default
//  is an application concern, not a database concern.
// ============================================================

// ─── Tenant provisioning ─────────────────────────────────────

// Permission strings stamped directly onto the owner identity at tenant creation.
export const TENANT_OWNER_DEFAULT_PERMISSIONS = ["iam:*:*"] as const;
