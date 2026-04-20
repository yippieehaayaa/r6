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
 * USER    — human user belonging to a tenant (owner, admin, or regular user —
 *           distinguished by the permissions stamped on the identity)
 * SERVICE — machine / service account for inter-service API calls
 */
export const IdentityKindSchema = z.enum(["USER", "SERVICE"]);

export type IdentityKind = z.infer<typeof IdentityKindSchema>;

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
