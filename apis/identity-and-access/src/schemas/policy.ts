import { z } from "zod";

const NAME_REGEX = /^[a-zA-Z0-9_\- ]+$/;
const ACTION_REGEX = /^(\*|[a-z0-9_-]+(\.[a-z0-9_*-]+)*)$/;
const RESOURCE_REGEX = /^(\*|[a-z0-9_-]+(\.[a-z0-9_*-]+)*)$/;
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
	actions: z
		.array(
			z
				.string()
				.min(1)
				.max(128)
				.regex(
					ACTION_REGEX,
					"Action must be dot-notation or wildcard (e.g. identity.create, *)",
				),
		)
		.min(1),
	resources: z
		.array(
			z
				.string()
				.min(1)
				.max(128)
				.regex(
					RESOURCE_REGEX,
					"Resource must be dot-notation or wildcard (e.g. identities.*, *)",
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
	actions: z
		.array(
			z
				.string()
				.min(1)
				.max(128)
				.regex(ACTION_REGEX, "Action must be dot-notation or wildcard"),
		)
		.min(1)
		.optional(),
	resources: z
		.array(
			z
				.string()
				.min(1)
				.max(128)
				.regex(RESOURCE_REGEX, "Resource must be dot-notation or wildcard"),
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
	action: z
		.string()
		.min(1)
		.max(128)
		.regex(ACTION_REGEX, "Action must be dot-notation or wildcard"),
	resource: z
		.string()
		.min(1)
		.max(128)
		.regex(RESOURCE_REGEX, "Resource must be dot-notation or wildcard"),
	audience: z
		.string()
		.min(1)
		.max(128)
		.regex(AUDIENCE_REGEX, "Audience must be a valid identifier"),
});
