import type { MiddlewareHandler } from "hono";
import type { JWTPayload } from "jose";
import { verifyAccessToken } from "../lib/jwt.js";

export type HonoVariables = {
	jwtPayload: JWTPayload & { kind?: string };
};

export const authMiddleware = (): MiddlewareHandler<{
	Variables: HonoVariables;
}> => {
	return async (c, next) => {
		const authHeader = c.req.header("Authorization");

		if (!authHeader?.startsWith("Bearer ")) {
			return c.json(
				{
					error: "unauthorized",
					message: "Missing or invalid Authorization header",
				},
				401,
			);
		}

		const token = authHeader.slice(7);

		try {
			const payload = await verifyAccessToken(token);
			c.set("jwtPayload", payload as HonoVariables["jwtPayload"]);
			await next();
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Invalid or expired token";
			return c.json({ error: "unauthorized", message }, 401);
		}
	};
};
