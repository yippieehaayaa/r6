import { getRoleById } from "@r6/db-identity-and-access";
import { PROTECTED_ROLES } from "@r6/schemas/identity-and-access";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../lib/errors";

// Blocks any write operation that targets a protected role ("tenant-owner",
// "tenant-admin"). These roles are managed exclusively via the provision
// endpoint and must not be mutated, deleted, or have their policies altered
// through normal tenant-scoped routes.
//
// Must run after authMiddleware(). Expects req.params.id to be the role UUID.
export const requireNotTargetingProtectedRole =
  () => async (req: Request, _res: Response, next: NextFunction) => {
    const roleId = req.params.id;
    if (!roleId || typeof roleId !== "string") return next();

    const role = await getRoleById(roleId);

    if (!role) {
      // Let the controller handle the 404.
      return next();
    }

    if ((PROTECTED_ROLES as readonly string[]).includes(role.name)) {
      return next(
        new AppError(
          403,
          "forbidden",
          `Cannot modify protected role "${role.name}"`,
        ),
      );
    }

    return next();
  };
