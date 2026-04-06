// ============================================================
//  guard/index.ts
//  Re-exports all authorization middleware guards.
//
//  All guards assume authMiddleware() has already run and
//  populated req.jwtPayload. They must be composed AFTER it
//  in the router chain.
//
//  Available guards:
//    requireAdmin                    — kind === "ADMIN" only
//    requireNotAdmin                 — blocks ADMIN from write operations
//    requireAdminOrTenantOwner       — ADMIN, OR identity that holds the
//                                      "tenant-owner" role within the target
//                                      tenant (tenantSlug match + role check)
//    requireSelfOrAdminOrTenantOwner — ADMIN, OR tenant owner within the target
//                                      tenant, OR the identity whose id matches
//                                      :id (the caller acting on themselves)
//    requireNotSelf                  — blocks identity from acting on their own /:id
//    requireTenantScope              — ensures the acting identity's tenantSlug
//                                      matches the :tenantSlug param
//    requirePermission               — fine-grained permission string check
// ============================================================

export { requireAdmin } from "./require-admin";
export { requireAdminOrTenantOwner } from "./require-admin-or-tenant-owner";
export { requireNotAdmin } from "./require-not-admin";
export { requireNotSelf } from "./require-not-self";
export { requirePermission } from "./require-permission";
export { requireSelfOrAdminOrTenantOwner } from "./require-self-or-admin-or-tenant-owner";
export { requireTenantScope } from "./require-tenant-scope";
