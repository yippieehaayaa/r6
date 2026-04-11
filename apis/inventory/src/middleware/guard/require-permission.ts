import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../lib/errors";
import { checkPermission } from "../../lib/jwt";
import type { AuthJwtPayload } from "../auth";

const RESOURCE_LABELS: Record<string, string> = {
  item: "items",
  stock: "stock",
  catalog: "catalog",
  warehouse: "warehouses",
  category: "categories",
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
  if (parts.length < 3) return "perform this action";

  const resource = parts[1];
  const action = parts[2];

  if (!resource || !action) return "perform this action";

  const noun = RESOURCE_LABELS[resource];
  const verb = ACTION_LABELS[action] ?? ACTION_LABELS["*"];

  if (!noun || !verb) return "perform this action";

  return `${verb} ${noun}`;
}

export const requirePermission =
  (required: string) => (req: Request, _res: Response, next: NextFunction) => {
    const payload = req.jwtPayload as AuthJwtPayload | undefined;

    if (!payload) {
      return next(new AppError(401, "unauthorized", "Authentication required"));
    }

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
