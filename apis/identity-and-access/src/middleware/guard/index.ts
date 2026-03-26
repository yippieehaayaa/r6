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
//    requireAdminOrTenantOwner — ADMIN, OR USER/SERVICE whose tenantId matches
//                               the :tenantId route param or request body
//    requireTenantScope       — ensures the acting identity's tenantId matches
//                               the :tenantId param (tenant-scoped routes)
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
//   - ADMIN (cross-tenant, no tenantId restriction)
//   - USER or SERVICE whose JWT tenantId matches the target tenant.
//
// The target tenant id is resolved from (in order):
//   1. req.params.tenantId
//   2. req.params.id           (for routes like /tenants/:id)
//   3. req.body.tenantId
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

    const targetTenantId: string | undefined =
      req.params.tenantId ?? req.params.id ?? req.body?.tenantId;

    if (!targetTenantId) {
      return res.status(400).json({
        error: "bad_request",
        message: "Unable to determine target tenant",
      });
    }

    if (payload.tenantId !== targetTenantId) {
      return res.status(403).json({
        error: "forbidden",
        message: "You do not have access to this tenant",
      });
    }

    return next();
  };

// ─── requireTenantScope ──────────────────────────────────────

// Ensures the acting identity's tenantId matches the :tenantId
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

    const routeTenantId = req.params.tenantId;

    if (!routeTenantId) {
      return res.status(400).json({
        error: "bad_request",
        message: "Route is missing tenantId parameter",
      });
    }

    if (payload.tenantId !== routeTenantId) {
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
