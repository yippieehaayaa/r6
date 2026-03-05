import { z } from "zod";

const NAME_REGEX = /^[a-zA-Z0-9_\- ]+$/;
const CLIENT_ID_REGEX = /^[a-zA-Z0-9_-]+$/;
const CLIENT_SECRET_REGEX =
	/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{16,}$/;
const AUDIENCE_REGEX = /^[a-zA-Z0-9_\-.:]+$/;

export const serviceClientParamsSchema = z.object({
	id: z.uuid(),
});

export const createServiceClientSchema = z.object({
	name: z
		.string()
		.min(2)
		.max(64)
		.regex(NAME_REGEX, "Name contains invalid characters"),
	clientId: z
		.string()
		.min(4)
		.max(64)
		.regex(
			CLIENT_ID_REGEX,
			"Client ID must contain only letters, numbers, underscores, or hyphens",
		),
	clientSecret: z
		.string()
		.min(16)
		.max(128)
		.regex(
			CLIENT_SECRET_REGEX,
			"Client secret must be at least 16 characters with uppercase, lowercase, number, and special character",
		),
	audience: z
		.array(
			z
				.string()
				.min(1)
				.max(128)
				.regex(AUDIENCE_REGEX, "Audience must be a valid identifier"),
		)
		.min(1),
	description: z.string().min(1).max(255).optional(),
	identityId: z.uuid().optional(),
});

export const updateServiceClientSchema = z.object({
	name: z
		.string()
		.min(2)
		.max(64)
		.regex(NAME_REGEX, "Name contains invalid characters")
		.optional(),
	description: z.string().min(1).max(255).optional(),
	audience: z
		.array(
			z
				.string()
				.min(1)
				.max(128)
				.regex(AUDIENCE_REGEX, "Audience must be a valid identifier"),
		)
		.min(1)
		.optional(),
	active: z.boolean().optional(),
});

export const verifyServiceClientSchema = z.object({
	clientId: z
		.string()
		.min(4)
		.max(64)
		.regex(CLIENT_ID_REGEX, "Invalid client ID format"),
	clientSecret: z.string().min(1).max(128),
});

export const rotateServiceClientSecretSchema = z.object({
	newSecret: z
		.string()
		.min(16)
		.max(128)
		.regex(
			CLIENT_SECRET_REGEX,
			"Client secret must be at least 16 characters with uppercase, lowercase, number, and special character",
		),
});

export const listServiceClientsSchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(20),
	search: z.string().min(1).max(100).optional(),
	active: z
		.string()
		.transform((v) => v === "true")
		.pipe(z.boolean())
		.optional(),
});
