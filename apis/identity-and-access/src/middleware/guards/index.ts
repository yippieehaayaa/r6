import type { NextFunction, Request, Response } from "express";
import { checkPermission } from "../../lib/jwt";

// ─── requireAdmin ─────────────────────────────────────────────
// Allows only identities with kind === "ADMIN".
export const requireAdmin =
  () => (req: Request, res: Response, next: NextFunction) => {
    if (req.jwtPayload?.kind !== "ADMIN") {
      return res.status(403).json({ error: "forbidden", message: "Admin access required" });
    }
    return next();
  };

// ─── requireAdminOrTenantOwner ────────────────────────────────
// Allows ADMINs unconditionally, or any identity whose JWT tenantId
// matches the route param identified by `param` (default "tenantId").
export const requireAdminOrTenantOwner =
  (param = "tenantId") =>
  (req: Request, res: Response, next: NextFunction) => {
    const payload = req.jwtPayload;
    if (!payload) {
      return res.status(403).json({ error: "forbidden", message: "Access denied" });
    }
    if (payload.kind === "ADMIN") return next();
    if (payload.tenantId && payload.tenantId === req.params[param]) return next();
    return res.status(403).json({ error: "forbidden", message: "Access denied" });
  };

// ─── requireTenantScope ───────────────────────────────────────
// Allows ADMINs unconditionally. Non-admins must have a JWT tenantId
// that matches the route param identified by `param` (default "tenantId").
export const requireTenantScope =
  (param = "tenantId") =>
  (req: Request, res: Response, next: NextFunction) => {
    const payload = req.jwtPayload;
    if (!payload) {
      return res.status(403).json({ error: "forbidden", message: "Access denied" });
    }
    if (payload.kind === "ADMIN") return next();
    if (payload.tenantId && payload.tenantId === req.params[param]) return next();
    return res.status(403).json({ error: "forbidden", message: "Tenant scope required" });
  };

// ─── requirePermission ────────────────────────────────────────
// Checks that the JWT permissions array satisfies a required permission
// string using wildcard `*` segment matching (service:resource:action).
export const requirePermission =
  (permission: string) =>
  (req: Request, res: Response, next: NextFunction) => {
    const granted = (req.jwtPayload?.permissions as string[] | undefined) ?? [];
    if (!checkPermission(permission, granted)) {
      return res.status(403).json({ error: "forbidden", message: `Missing permission: ${permission}` });
    }
    return next();
  };
