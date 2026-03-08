import { Hono } from "hono";
import type { HonoVariables } from "../../middleware/auth.js";
import { authMiddleware } from "../../middleware/auth.js";

const main = new Hono<{ Variables: HonoVariables }>();

main.get("/", (c) => {
	return c.body(null, 200);
});

/**
 * GET /me
 * Protected — requires a valid Bearer access token.
 * Returns the decoded JWT payload (sub, kind, iat, exp, iss, aud).
 * Use this as the pattern for all future protected routes.
 */
main.get("/me", authMiddleware(), (c) => {
	return c.json(c.get("jwtPayload"));
});

export default main;
