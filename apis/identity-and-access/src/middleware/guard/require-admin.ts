import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../lib/errors";
import type { AuthJwtPayload } from "../auth";

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
