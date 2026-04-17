import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../lib/errors";
import type { AuthJwtPayload } from "../auth";

export const requireTenantScope =
  () => (req: Request, _res: Response, next: NextFunction) => {
    const payload = req.jwtPayload as AuthJwtPayload | undefined;

    if (!payload) {
      return next(new AppError(401, "unauthorized", "Authentication required"));
    }

    if (payload.kind === "ADMIN") return next();

    const routeTenantId = req.params.tenantId;

    if (!routeTenantId) {
      return next(
        new AppError(400, "bad_request", "Route is missing tenantId parameter"),
      );
    }

    if (payload.tenantId !== routeTenantId) {
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
