import type { NextFunction, Request, Response } from "express";
import type { JWTPayload } from "jose";
import { verifyAccessToken } from "../../lib/jwt";
import { isAccessTokenRevoked } from "../../lib/token-denylist";

export type AuthJwtPayload = JWTPayload & {
  kind?: string;
  tenantSlug?: string | null;
  roles?: string[];
  permissions?: string[];
};

export const authMiddleware =
  () => async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.header("Authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "unauthorized",
        message: "Missing or invalid Authorization header",
      });
    }

    const parts = authHeader.split(" ");

    if (parts[0] !== "Bearer" || !parts[1]) {
      return res.status(401).json({
        error: "unauthorized",
        message: "Missing or invalid Authorization header",
      });
    }

    const token = parts[1];

    try {
      const payload = (await verifyAccessToken(token)) as AuthJwtPayload;

      if (payload.jti && (await isAccessTokenRevoked(payload.jti))) {
        return res.status(401).json({
          error: "token_revoked",
          message: "Token has been revoked",
        });
      }

      req.jwtPayload = payload;
      return next();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Invalid or expired token";
      return res.status(401).json({ error: "unauthorized", message });
    }
  };
