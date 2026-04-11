import type { NextFunction, Request, Response } from "express";
import type { JWTPayload } from "jose";
import { AppError } from "../../lib/errors";
import { verifyAccessToken } from "../../lib/jwt";
import { isAccessTokenRevoked } from "../../lib/token-denylist";

export type AuthJwtPayload = JWTPayload & {
	kind?: string;
	tenantId?: string | null;
	tenantSlug?: string | null;
	roles?: string[];
	permissions?: string[];
};

export const authMiddleware =
	() => async (req: Request, _res: Response, next: NextFunction) => {
		const authHeader = req.header("Authorization");

		if (!authHeader?.startsWith("Bearer ")) {
			return next(
				new AppError(
					401,
					"unauthorized",
					"Missing or invalid Authorization header",
				),
			);
		}

		const token = authHeader.slice(7);

		try {
			const payload = (await verifyAccessToken(token)) as AuthJwtPayload;

			if (!payload.jti) {
				return next(
					new AppError(401, "unauthorized", "Token missing required jti claim"),
				);
			}

			if (await isAccessTokenRevoked(payload.jti)) {
				return next(
					new AppError(401, "token_revoked", "Token has been revoked"),
				);
			}

			req.jwtPayload = payload;
			return next();
		} catch (err) {
			if (err instanceof AppError) return next(err);
			return next(
				new AppError(401, "unauthorized", "Invalid or expired token"),
			);
		}
	};
