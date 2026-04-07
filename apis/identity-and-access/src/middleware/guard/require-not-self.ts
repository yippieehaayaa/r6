import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../lib/errors";
import type { AuthJwtPayload } from "../auth";

// Blocks an identity from performing a write operation on their own record.
// Prevents self-deletion, self-update, and self-role-assignment.
// Intended to run after requireNotAdmin() on all /:id write routes.
export const requireNotSelf =
  () => (req: Request, _res: Response, next: NextFunction) => {
    const payload = req.jwtPayload as AuthJwtPayload | undefined;

    if (!payload) {
      return next(new AppError(401, "unauthorized", "Authentication required"));
    }

    if (payload.sub === req.params.id) {
      return next(
        new AppError(
          403,
          "forbidden",
          "You cannot perform this action on your own account",
        ),
      );
    }

    return next();
  };
