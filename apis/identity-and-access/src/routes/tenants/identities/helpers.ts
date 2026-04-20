// ============================================================
//  helpers.ts
//  Shared utilities for the /tenants/:tenantId/identities routes.
//
//  Exported:
//    toSafeIdentity        — strips hash/salt/totpSecret before response
//    resolveCallerTier     — derives the caller's tier from JWT + tenant
//    resolveTargetTier     — derives a target identity's tier from DB row + tenant
//    assertCanMutate       — enforces tier-based write guards
//    assertPolicyBelongsToTenant — validates policy ownership
// ============================================================

import type {
  Identity,
  IdentityPermission,
  Policy,
  Tenant,
} from "@r6/db-identity-and-access";
import { IdentitySafeSchema } from "@r6/schemas";
import { AppError } from "../../../lib/errors";
import { checkPermission } from "../../../lib/jwt";
import type { AuthJwtPayload } from "../../../middleware/auth";
import { IdentityTier } from "./constants";

// ─── Safe identity shape ──────────────────────────────────────────────────────

// Returns the identity stripped of all sensitive fields (hash, salt, totpSecret).
// Use this for every API response that includes an identity object.
export function toSafeIdentity(identity: Identity) {
  return IdentitySafeSchema.parse(identity);
}

// ─── Tier resolution ──────────────────────────────────────────────────────────

// Determines the tier of the authenticated caller.
// 1. OWNER — JWT subject matches the tenant owner.
// 2. ADMIN — JWT permissions include iam:*:* (wildcard).
// 3. USER  — everything else.
export function resolveCallerTier(
  payload: AuthJwtPayload,
  tenant: Tenant,
): IdentityTier {
  if (payload.sub === tenant.ownerId) return IdentityTier.OWNER;
  if (checkPermission("iam:*:*", payload.permissions ?? []))
    return IdentityTier.ADMIN;
  return IdentityTier.USER;
}

// Determines the tier of a target identity from its DB permission rows.
// 1. OWNER — target.id matches the tenant owner.
// 2. ADMIN — target has an ALLOW row with permission = "iam:*:*".
// 3. USER  — everything else.
export function resolveTargetTier(
  target: Identity & { identityPermissions: IdentityPermission[] },
  tenant: Tenant,
): IdentityTier {
  if (target.id === tenant.ownerId) return IdentityTier.OWNER;
  const isAdmin = target.identityPermissions.some(
    (p) => p.permission === "iam:*:*",
  );
  if (isAdmin) return IdentityTier.ADMIN;
  return IdentityTier.USER;
}

// ─── Mutation guard ───────────────────────────────────────────────────────────

// Enforces write protection based on caller tier vs. target tier.
//
// Rules:
//   - Caller may never mutate themselves via tenant routes (use /me).
//   - Caller tier must be strictly above target tier, OR caller is OWNER
//     mutating any non-owner identity (same-ADMIN block prevents peers).
//
// Throws AppError(403) on any violation.
export function assertCanMutate(
  callerTier: IdentityTier,
  targetTier: IdentityTier,
  targetId: string,
  callerId: string,
): void {
  if (targetId === callerId) {
    throw new AppError(
      403,
      "forbidden",
      "You cannot manage your own account via this route. Use the /me endpoints instead.",
    );
  }

  if (callerTier < targetTier) {
    throw new AppError(
      403,
      "forbidden",
      "You do not have sufficient permissions to manage this identity.",
    );
  }

  // Admins cannot mutate peer admins — only the owner may do that.
  if (callerTier === targetTier && callerTier !== IdentityTier.OWNER) {
    throw new AppError(
      403,
      "forbidden",
      "You do not have sufficient permissions to manage this identity.",
    );
  }
}

// ─── Policy ownership check ───────────────────────────────────────────────────

// Asserts a policy exists and belongs to the given tenant.
// Throws AppError(404) if the policy is null.
// Throws AppError(403) if it belongs to a different tenant.
export function assertPolicyBelongsToTenant(
  policy: Policy | null,
  tenantId: string,
): asserts policy is Policy {
  if (!policy) {
    throw new AppError(404, "not_found", "Policy not found");
  }
  if (policy.tenantId !== tenantId) {
    throw new AppError(
      403,
      "forbidden",
      "Policy does not belong to this tenant",
    );
  }
}
