// ============================================================
//  guards.ts
//  Reusable Express middleware for authorization.
//
//  All guards assume authMiddleware() has already run and
//  populated req.jwtPayload. They must be composed AFTER it
//  in the router chain.
//
//  Available guards:
//    requireAuth              — any valid token (already done by authMiddleware,
//                               re-exported here for co-location)
//    requireAdmin             — kind === "ADMIN" only
//    requireAdminOrTenantOwner — ADMIN, OR USER/SERVICE whose tenantSlug matches
//                               the :tenantSlug route param or request body
//    requireTenantScope       — ensures the acting identity's tenantSlug matches
//                               the :tenantSlug param (tenant-scoped routes)
// ============================================================

import type { NextFunction, Request, Response } from "express";
import type { AuthJwtPayload } from "../auth";

// ─── requireAdmin ────────────────────────────────────────────

// Allows only ADMIN identities (kind === "ADMIN").
// All platform-level management routes (cross-tenant) use this guard.
export const requireAdmin =
  () => (req: Request, res: Response, next: NextFunction) => {
    const payload = req.jwtPayload as AuthJwtPayload | undefined;

    if (!payload) {
      return res.status(401).json({
        error: "unauthorized",
        message: "Authentication required",
      });
    }

    if (payload.kind !== "ADMIN") {
      return res.status(403).json({
        error: "forbidden",
        message: "This action requires ADMIN privileges",
      });
    }

    return next();
  };

// ─── requireAdminOrTenantOwner ───────────────────────────────

// Allows:
//   - ADMIN (cross-tenant, no tenantSlug restriction)
//   - USER or SERVICE whose JWT tenantSlug matches the target tenant.
//
// The target tenant slug is resolved from (in order):
//   1. req.params.tenantSlug
//   2. req.params.id           (for routes like /tenants/:id)
//   3. req.body.tenantSlug
//
// Used for Tenant read/update routes.
export const requireAdminOrTenantOwner =
  () => (req: Request, res: Response, next: NextFunction) => {
    const payload = req.jwtPayload as AuthJwtPayload | undefined;

    if (!payload) {
      return res.status(401).json({
        error: "unauthorized",
        message: "Authentication required",
      });
    }

    if (payload.kind === "ADMIN") return next();

    const targetTenantSlug: string | undefined =
      req.params.tenantSlug ?? req.params.id ?? req.body?.tenantSlug;

    if (!targetTenantSlug) {
      return res.status(400).json({
        error: "bad_request",
        message: "Unable to determine target tenant",
      });
    }

    if (payload.tenantSlug !== targetTenantSlug) {
      return res.status(403).json({
        error: "forbidden",
        message: "You do not have access to this tenant",
      });
    }

    return next();
  };

// ─── requireTenantScope ──────────────────────────────────────

// Ensures the acting identity's tenantSlug matches the :tenantSlug
// route param. Used for tenant-scoped resource routes
// (identities, roles, policies) where even an identity within
// one tenant must not access another tenant's resources.
//
// ADMIN bypasses this check (cross-tenant access allowed).
export const requireTenantScope =
  () => (req: Request, res: Response, next: NextFunction) => {
    const payload = req.jwtPayload as AuthJwtPayload | undefined;

    if (!payload) {
      return res.status(401).json({
        error: "unauthorized",
        message: "Authentication required",
      });
    }

    if (payload.kind === "ADMIN") return next();

    const routeTenantSlug = req.params.tenantSlug;

    if (!routeTenantSlug) {
      return res.status(400).json({
        error: "bad_request",
        message: "Route is missing tenantSlug parameter",
      });
    }

    if (payload.tenantSlug !== routeTenantSlug) {
      return res.status(403).json({
        error: "forbidden",
        message: "You do not have access to this tenant's resources",
      });
    }

    return next();
  };

// ─── requirePermission ───────────────────────────────────────

// Fine-grained permission check against the flattened permissions
// array signed into the token. Supports wildcards via checkPermission.
//
// Usage:
//   router.delete(
//     "/tenants/:tenantId/identities/:id",
//     authMiddleware(),
//     requirePermission("iam:identity:delete"),
//     softDeleteIdentityHandler,
//   );
import { checkPermission } from "../../lib/jwt";

export const requirePermission =
  (required: string) => (req: Request, res: Response, next: NextFunction) => {
    const payload = req.jwtPayload as AuthJwtPayload | undefined;

    if (!payload) {
      return res.status(401).json({
        error: "unauthorized",
        message: "Authentication required",
      });
    }

    // ADMIN identities have unrestricted platform access and do not carry
    // per-resource permission strings in their JWT.
    if (payload.kind === "ADMIN") return next();

    const granted: string[] = Array.isArray(payload.permissions)
      ? (payload.permissions as string[])
      : [];

    if (!checkPermission(required, granted)) {
      return res.status(403).json({
        error: "forbidden",
        message: `Missing required permission: ${required}`,
      });
    }

    return next();
  };
