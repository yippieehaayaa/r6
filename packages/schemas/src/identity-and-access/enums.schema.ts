import { z } from "zod";

// ============================================================
//  IAM ENUM SCHEMAS
// ============================================================

/**
 * Lifecycle state of an Identity.
 *
 * ACTIVE               — can log in and perform actions
 * INACTIVE             — disabled by an admin, cannot log in
 * SUSPENDED            — locked due to policy (e.g. too many failed logins)
 * PENDING_VERIFICATION — registered but e-mail not yet verified
 */
export const IdentityStatusSchema = z.enum([
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
  "PENDING_VERIFICATION",
]);

export type IdentityStatus = z.infer<typeof IdentityStatusSchema>;

/**
 * Type / kind of identity.
 *
 * USER    — human user belonging to a tenant
 * SERVICE — machine / service account for inter-service API calls
 * ADMIN   — platform-level super admin (cross-tenant, SaaS operator only)
 */
export const IdentityKindSchema = z.enum(["USER", "SERVICE", "ADMIN"]);

export type IdentityKind = z.infer<typeof IdentityKindSchema>;

/**
 * Whether a policy grants or explicitly denies access.
 * DENY always takes precedence over ALLOW when both match.
 */
export const PolicyEffectSchema = z.enum(["ALLOW", "DENY"]);

export type PolicyEffect = z.infer<typeof PolicyEffectSchema>;

/**
 * Recognised microservice / module names.
 * Mirrors the TenantModule Prisma enum.
 * Lowercase values match the audience string convention used in permission
 * checks. IAM access is always implicit and not gated by moduleAccess.
 */
export const TenantModuleEnum = [
  "hris",
  "inventory",
  "procurement",
  "pos",
  "financial",
  "request",
  "rma",
] as const;
export type TenantModule = (typeof TenantModuleEnum)[number];
export const TenantModuleSchema = z.enum(TenantModuleEnum);
