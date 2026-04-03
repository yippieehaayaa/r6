// ============================================================
//  guards.ts
//  Reusable Express middleware for authorization.
//
//  All guards assume authMiddleware() has already run and
//  populated req.jwtPayload. They must be composed AFTER it
//  in the router chain.
//
//  Available guards:
//    requireAdmin                    — kind === "ADMIN" only
//    requireAdminOrTenantOwner       — ADMIN, OR identity that holds the
//                                      "tenant-owner" role within the target
//                                      tenant (tenantSlug match + role check)
//    requireSelfOrAdminOrTenantOwner — ADMIN, OR tenant owner within the target
//                                      tenant, OR the identity whose id matches
//                                      :id (the caller acting on themselves)
//    requireTenantScope              — ensures the acting identity's tenantSlug
//                                      matches the :tenantSlug param
//    requirePermission               — fine-grained permission string check
// ============================================================

import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../lib/errors";
import { checkPermission } from "../../lib/jwt";
import type { AuthJwtPayload } from "../auth";

// ─── describePermission ──────────────────────────────────────

// Converts a permission string (e.g. "iam:identity:create") into a
// human-readable phrase (e.g. "create identities") for use in error
// messages. Falls back to "perform this action" for unknown patterns.
const RESOURCE_LABELS: Record<string, string> = {
  identity: "identities",
  role: "roles",
  policy: "policies",
  tenant: "tenants",
  user: "users",
};

const ACTION_LABELS: Record<string, string> = {
  create: "create",
  read: "view",
  update: "update",
  delete: "delete",
  "*": "manage",
};

function describePermission(required: string): string {
  const parts = required.split(":");
  // Expect at least "service:resource:action"
  if (parts.length < 3) return "perform this action";

  const resource = parts[1];
  const action = parts[2];

  if (!resource || !action) return "perform this action";

  const noun = RESOURCE_LABELS[resource];
  const verb = ACTION_LABELS[action] ?? ACTION_LABELS["*"];

  if (!noun || !verb) return "perform this action";

  return `${verb} ${noun}`;
}

// ─── requireAdmin ────────────────────────────────────────────

// Allows only ADMIN identities (kind === "ADMIN").
// All platform-level management routes (cross-tenant) use this guard.
export const requireAdmin =
  () => (req: Request, _res: Response, next: NextFunction) => {
    const payload = req.jwtPayload as AuthJwtPayload | undefined;

    if (!payload) {
      return next(new AppError(401, "unauthorized", "Authentication required"));
    }

    if (payload.kind !== "ADMIN") {
      return next(
        new AppError(
          403,
          "forbidden",
          "This action requires administrator privileges",
        ),
      );
    }

    return next();
  };

// ─── requireAdminOrTenantOwner ───────────────────────────────

// Allows:
//   - ADMIN (cross-tenant, no tenantSlug restriction)
//   - USER or SERVICE that holds the "tenant-owner" role AND whose JWT
//     tenantSlug matches the target tenant slug, resolved from (in order):
//       1. req.params.tenantSlug
//       2. req.params.id  (for routes like /tenants/:id)
//       3. req.body.tenantSlug
//
// Used for tenant management routes and bulk identity operations.
export const requireAdminOrTenantOwner =
  () => (req: Request, _res: Response, next: NextFunction) => {
    const payload = req.jwtPayload as AuthJwtPayload | undefined;

    if (!payload) {
      return next(new AppError(401, "unauthorized", "Authentication required"));
    }

    if (payload.kind === "ADMIN") return next();

    const targetTenantSlug: string | undefined =
      req.params.tenantSlug ?? req.params.id ?? req.body?.tenantSlug;

    if (!targetTenantSlug) {
      return next(
        new AppError(400, "bad_request", "Unable to determine target tenant"),
      );
    }

    const roles: string[] = Array.isArray(payload.roles) ? payload.roles : [];

    if (
      !roles.includes("tenant-owner") ||
      payload.tenantSlug !== targetTenantSlug
    ) {
      return next(
        new AppError(
          403,
          "forbidden",
          "You do not have owner access to this tenant",
        ),
      );
    }

    return next();
  };

// ─── requireSelfOrAdminOrTenantOwner ─────────────────────────

// Allows:
//   - ADMIN (cross-tenant, no restriction)
//   - USER or SERVICE that holds the "tenant-owner" role within the
//     target tenant (tenantSlug match + role check)
//   - The identity whose primary key matches :id (acting on themselves)
//
// Used for per-identity read/update routes where a regular user may only
// operate on their own record, while admins and tenant owners can reach any.
export const requireSelfOrAdminOrTenantOwner =
  () => (req: Request, _res: Response, next: NextFunction) => {
    const payload = req.jwtPayload as AuthJwtPayload | undefined;

    if (!payload) {
      return next(new AppError(401, "unauthorized", "Authentication required"));
    }

    if (payload.kind === "ADMIN") return next();

    const roles: string[] = Array.isArray(payload.roles) ? payload.roles : [];
    const tenantSlug = req.params.tenantSlug;

    if (roles.includes("tenant-owner") && payload.tenantSlug === tenantSlug) {
      return next();
    }

    if (payload.sub === req.params.id) return next();

    return next(
      new AppError(
        403,
        "forbidden",
        "You can only perform this action on your own identity",
      ),
    );
  };

// ─── requireTenantScope ──────────────────────────────────────

// Ensures the acting identity's tenantSlug matches the :tenantSlug
// route param. Used for tenant-scoped resource routes
// (identities, roles, policies) where even an identity within
// one tenant must not access another tenant's resources.
//
// ADMIN bypasses this check (cross-tenant access allowed).
export const requireTenantScope =
  () => (req: Request, _res: Response, next: NextFunction) => {
    const payload = req.jwtPayload as AuthJwtPayload | undefined;

    if (!payload) {
      return next(new AppError(401, "unauthorized", "Authentication required"));
    }

    if (payload.kind === "ADMIN") return next();

    const routeTenantSlug = req.params.tenantSlug;

    if (!routeTenantSlug) {
      return next(
        new AppError(
          400,
          "bad_request",
          "Route is missing tenantSlug parameter",
        ),
      );
    }

    if (payload.tenantSlug !== routeTenantSlug) {
      return next(
        new AppError(
          403,
          "forbidden",
          "Your token is not scoped to this tenant",
        ),
      );
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
export const requirePermission =
  (required: string) => (req: Request, _res: Response, next: NextFunction) => {
    const payload = req.jwtPayload as AuthJwtPayload | undefined;

    if (!payload) {
      return next(new AppError(401, "unauthorized", "Authentication required"));
    }

    // ADMIN identities have unrestricted platform access and do not carry
    // per-resource permission strings in their JWT.
    if (payload.kind === "ADMIN") return next();

    const granted: string[] = Array.isArray(payload.permissions)
      ? (payload.permissions as string[])
      : [];

    if (!checkPermission(required, granted)) {
      return next(
        new AppError(
          403,
          "forbidden",
          `You do not have permission to ${describePermission(required)}`,
        ),
      );
    }

    return next();
  };
