import type { NextFunction, Request, Response } from "express";
import type { AuthJwtPayload } from "../auth";
import { ForbiddenError, UnauthorizedError } from "../../errors";

// Checks whether a required permission string is satisfied by the granted
// permission strings from the JWT payload. Supports wildcard * segments.
//
// Examples:
//   "inventory:*:*" satisfies required "inventory:stock:read"
//   "catalog:*:*"   satisfies required "catalog:product:create"
function checkPermission(required: string, granted: string[]): boolean {
  const r = required.split(":");
  if (r.length !== 3) return false;

  return granted.some((g) => {
    const parts = g.split(":");
    if (parts.length !== 3) return false;
    return parts.every((seg, i) => seg === "*" || seg === r[i]);
  });
}

// Guard that checks whether the authenticated identity holds a specific
// permission.  ADMIN identities (kind === "ADMIN") bypass all permission
// checks since they have unrestricted platform access.
//
// Usage:
//   router.use("/inventory", authMiddleware(), requirePermission("inventory:*:*"), inventoryController);
//   router.use("/catalog",   authMiddleware(), requirePermission("catalog:*:*"),   catalogController);
export const requirePermission =
  (required: string) => (req: Request, _res: Response, next: NextFunction) => {
    const payload = req.jwtPayload as AuthJwtPayload | undefined;

    if (!payload) {
      return next(new UnauthorizedError("Authentication required"));
    }

    // ADMIN bypasses all permission checks, but we validate the expected
    // claim invariants first.  An ADMIN token must carry a subject and must
    // not have a tenant scope.  Failing closed here prevents a spoofed or
    // misconfigured upstream payload from escalating to full platform access.
    if (payload.kind === "ADMIN") {
      if (!payload.sub || payload.tenantSlug !== null) {
        return next(new ForbiddenError("Malformed identity claims"));
      }
      return next();
    }

    const granted: string[] = Array.isArray(payload.permissions)
      ? payload.permissions
      : [];

    if (!checkPermission(required, granted)) {
      return next(new ForbiddenError("You do not have permission to perform this action"));
    }

    return next();
  };
