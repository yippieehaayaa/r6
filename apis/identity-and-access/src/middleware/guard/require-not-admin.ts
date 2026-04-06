import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../lib/errors";
import type { AuthJwtPayload } from "../auth";

// Blocks ADMIN identities from write operations on tenant-scoped resources.
// Admins are observers only — they can read across tenants but must not
// create, update, delete, restore, or assign roles to tenant identities.
export const requireNotAdmin =
  () => (req: Request, _res: Response, next: NextFunction) => {
    const payload = req.jwtPayload as AuthJwtPayload | undefined;

    if (!payload) {
      return next(new AppError(401, "unauthorized", "Authentication required"));
    }

    if (payload.kind === "ADMIN") {
      return next(
        new AppError(
          403,
          "forbidden",
          "Administrators cannot perform write operations on tenant identities",
        ),
      );
    }

    return next();
  };
