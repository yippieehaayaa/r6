import { z } from "zod";

const NAME_REGEX = /^[a-zA-Z0-9_\- ]+$/;
const PERMISSION_REGEX = /^(\*|[a-z0-9_-]+):(\*|[a-z0-9_-]+):(\*|[a-z0-9_-]+)$/;
const AUDIENCE_REGEX = /^[a-zA-Z0-9_\-.:]+$/;

export const policyParamsSchema = z.object({
	id: z.uuid(),
});

export const createPolicySchema = z.object({
	name: z
		.string()
		.min(2)
		.max(64)
		.regex(NAME_REGEX, "Policy name contains invalid characters"),
	description: z.string().min(1).max(255).optional(),
	effect: z.enum(["ALLOW", "DENY"]),
	permissions: z
		.array(
			z
				.string()
				.min(1)
				.max(128)
				.regex(
					PERMISSION_REGEX,
					"Permission must be {service}:{resource}:{action} format, wildcards allowed (e.g. iam:otp:write, iam:*:*)",
				),
		)
		.min(1),
	audience: z
		.array(
			z
				.string()
				.min(1)
				.max(128)
				.regex(
					AUDIENCE_REGEX,
					"Audience must be a valid identifier (e.g. iam-api, service.name)",
				),
		)
		.min(1),
	conditions: z.record(z.string(), z.unknown()).optional(),
});

export const updatePolicySchema = z.object({
	name: z
		.string()
		.min(2)
		.max(64)
		.regex(NAME_REGEX, "Policy name contains invalid characters")
		.optional(),
	description: z.string().min(1).max(255).optional(),
	effect: z.enum(["ALLOW", "DENY"]).optional(),
	permissions: z
		.array(
			z
				.string()
				.min(1)
				.max(128)
				.regex(
					PERMISSION_REGEX,
					"Permission must be {service}:{resource}:{action} format, wildcards allowed",
				),
		)
		.min(1)
		.optional(),
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
	conditions: z.record(z.string(), z.unknown()).optional(),
});

export const listPoliciesSchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(20),
	search: z.string().min(1).max(100).optional(),
	effect: z.enum(["ALLOW", "DENY"]).optional(),
});

export const evaluateAccessSchema = z.object({
	identityId: z.uuid(),
	permission: z
		.string()
		.min(1)
		.max(128)
		.regex(
			PERMISSION_REGEX,
			"Permission must be {service}:{resource}:{action} format, wildcards allowed",
		),
	audience: z
		.string()
		.min(1)
		.max(128)
		.regex(AUDIENCE_REGEX, "Audience must be a valid identifier"),
});
