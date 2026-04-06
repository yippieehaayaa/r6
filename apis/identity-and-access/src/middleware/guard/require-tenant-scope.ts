import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../lib/errors";
import type { AuthJwtPayload } from "../auth";

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
