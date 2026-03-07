import { randomUUID } from "node:crypto";
import account from "@r6/db-identity-and-access/models/account";
import session from "@r6/db-identity-and-access/models/session";
import { Hono } from "hono";
import { env } from "../../config.js";
import { getPublicJwk, signAccessToken } from "../../lib/jwt.js";
import {
	createIdentitySchema,
	verifyIdentitySchema,
} from "../../schemas/identity.js";
import {
	rotateSessionSchema,
	sessionTokenParamsSchema,
} from "../../schemas/session.js";

const isErrorName = (err: unknown, name: string): err is Error =>
	err instanceof Error && err.name === name;

const auth = new Hono();

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

auth.post("/register", async (c) => {
	const body = await c.req.json();
	const parsed = createIdentitySchema.safeParse(body);

	if (!parsed.success) {
		return c.json(
			{ error: "validation_error", issues: parsed.error.issues },
			400,
		);
	}

	try {
		const identity = await account.createIdentity(parsed.data);
		return c.json(identity, 201);
	} catch (err) {
		if (
			isErrorName(err, "UsernameExistsError") ||
			isErrorName(err, "EmailExistsError")
		) {
			return c.json(
				{ error: "conflict", message: (err as Error).message },
				409,
			);
		}
		throw err;
	}
});

auth.post("/login", async (c) => {
	const body = await c.req.json();
	const parsed = verifyIdentitySchema.safeParse(body);

	if (!parsed.success) {
		return c.json(
			{ error: "validation_error", issues: parsed.error.issues },
			400,
		);
	}

	try {
		const identity = await account.verifyIdentity(parsed.data);

		const accessToken = await signAccessToken({
			sub: identity.id,
			kind: identity.kind,
			status: identity.status,
			roles: identity.roles.map((r) => r.name),
		});

		const rawRefreshToken = randomUUID();

		await session.createSession({
			token: rawRefreshToken,
			identityId: identity.id,
			audience: [env.JWT_AUDIENCE],
			ipAddress: parsed.data.ipAddress,
			userAgent: parsed.data.userAgent,
			kind: "REFRESH",
			ttlMs: REFRESH_TOKEN_TTL_MS,
		});

		return c.json({
			accessToken,
			refreshToken: rawRefreshToken,
			expiresIn: Number(env.JWT_ACCESS_TTL_MS) / 1000,
			tokenType: "Bearer",
		});
	} catch (err) {
		if (isErrorName(err, "InvalidCredentialsError")) {
			return c.json(
				{ error: "unauthorized", message: (err as Error).message },
				401,
			);
		}
		if (isErrorName(err, "AccountLockedError")) {
			return c.json(
				{ error: "account_locked", message: (err as Error).message },
				423,
			);
		}
		throw err;
	}
});

auth.post("/refresh", async (c) => {
	const body = await c.req.json();
	const parsed = rotateSessionSchema.safeParse(body);

	if (!parsed.success) {
		return c.json(
			{ error: "validation_error", issues: parsed.error.issues },
			400,
		);
	}

	try {
		const newRawToken = randomUUID();

		const newSession = await session.rotateSession(parsed.data.token, {
			token: newRawToken,
			ipAddress: parsed.data.ipAddress,
			userAgent: parsed.data.userAgent,
		});

		const identity = await account.getIdentityById(newSession.identityId);

		const accessToken = await signAccessToken({
			sub: identity.id,
			kind: identity.kind,
			status: identity.status,
			roles: identity.roles.map((r) => r.name),
		});

		return c.json({
			accessToken,
			refreshToken: newRawToken,
			expiresIn: Number(env.JWT_ACCESS_TTL_MS) / 1000,
			tokenType: "Bearer",
		});
	} catch (err) {
		if (
			isErrorName(err, "SessionNotFoundError") ||
			isErrorName(err, "SessionRevokedError") ||
			isErrorName(err, "SessionExpiredError")
		) {
			return c.json(
				{ error: "unauthorized", message: (err as Error).message },
				401,
			);
		}
		throw err;
	}
});

auth.post("/logout", async (c) => {
	const body = await c.req.json();
	const parsed = sessionTokenParamsSchema.safeParse(body);

	if (!parsed.success) {
		return c.json(
			{ error: "validation_error", issues: parsed.error.issues },
			400,
		);
	}

	try {
		await session.revokeSession(parsed.data.token);
		return c.body(null, 204);
	} catch (err) {
		if (isErrorName(err, "SessionNotFoundError")) {
			return c.json(
				{ error: "not_found", message: (err as Error).message },
				404,
			);
		}
		throw err;
	}
});

export const wellknown = new Hono();

wellknown.get("/jwks.json", async (c) => {
	const jwk = await getPublicJwk();
	c.header("Cache-Control", "public, max-age=3600");
	return c.json({ keys: [jwk] });
});

export default auth;
