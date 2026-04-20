import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../lib/errors";
import { checkPermission } from "../../lib/jwt";
import type { AuthJwtPayload } from "../auth";

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
