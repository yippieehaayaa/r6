import { getIdentityWithRoles } from "@r6/db-identity-and-access";
import { PROTECTED_ROLES } from "@r6/schemas/identity-and-access";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../lib/errors";
import type { AuthJwtPayload } from "../auth";

// Blocks callers who do not hold the "tenant-owner" role (or ADMIN kind) from
// performing role-assignment operations on an identity that already holds a
// protected role ("tenant-owner" or "tenant-admin").
//
// This prevents a tenant-admin from modifying the roles of a tenant-owner or
// another tenant-admin.
//
// Must run after authMiddleware() and requireNotAdmin() so that req.jwtPayload
// is populated. Expects req.params.id to be the target identity's UUID.
export const requireNotTargetingElevatedIdentity =
  () => async (req: Request, _res: Response, next: NextFunction) => {
    const payload = req.jwtPayload as AuthJwtPayload | undefined;

    if (!payload) {
      return next(new AppError(401, "unauthorized", "Authentication required"));
    }

    // Platform ADMIN is always allowed.
    if (payload.kind === "ADMIN") return next();

    // Tenant-owner can manage any identity within their tenant.
    const callerRoles: string[] = Array.isArray(payload.roles)
      ? payload.roles
      : [];
    if (callerRoles.includes("tenant-owner")) return next();

    // For everyone else, fetch the target identity's current roles.
    const targetId = req.params.id;
    if (!targetId || typeof targetId !== "string") return next();
    const target = await getIdentityWithRoles(targetId);

    if (!target) {
      // Let the controller handle the 404.
      return next();
    }

    const targetHasElevatedRole = target.roles.some((r) =>
      (PROTECTED_ROLES as readonly string[]).includes(r.name),
    );

    if (targetHasElevatedRole) {
      return next(
        new AppError(
          403,
          "forbidden",
          "You do not have permission to modify roles for this identity",
        ),
      );
    }

    return next();
  };
