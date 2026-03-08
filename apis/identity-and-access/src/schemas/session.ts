import { z } from "zod";

const AUDIENCE_REGEX = /^[a-zA-Z0-9_\-.:]+$/;

export const createSessionSchema = z.object({
	identityId: z.uuid(),
	audience: z
		.array(
			z
				.string()
				.min(1)
				.max(128)
				.regex(AUDIENCE_REGEX, "Audience must be a valid identifier"),
		)
		.min(1),
	ipAddress: z.ipv4().or(z.ipv6()).optional(),
	userAgent: z.string().max(512).optional(),
	kind: z.enum(["REFRESH", "API_KEY"]).optional(),
	ttlMs: z
		.number()
		.int()
		.min(60_000)
		.max(30 * 24 * 60 * 60 * 1000)
		.optional(),
});

export const rotateSessionSchema = z.object({
	token: z.string().min(1).max(512),
	ipAddress: z.ipv4().or(z.ipv6()).optional(),
	userAgent: z.string().max(512).optional(),
});

export const sessionTokenParamsSchema = z.object({
	token: z.string().min(1).max(512),
});
