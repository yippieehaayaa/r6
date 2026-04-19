// ============================================================
//  constants.ts
//  Tier levels for identity mutation authorization.
//
//  Tiers are ordered numerically so comparison operators work:
//    callerTier >= targetTier  → caller may mutate target
//
//  OWNER (3) — the tenant.ownerId identity; has iam:*:* stamped
//              at tenant creation.
//  ADMIN (2) — a USER identity that has been granted iam:*:*
//              via an IdentityPermission ALLOW row.
//  USER  (1) — everyone else; limited permission set.
// ============================================================

export enum IdentityTier {
  USER = 1,
  ADMIN = 2,
  OWNER = 3,
}
