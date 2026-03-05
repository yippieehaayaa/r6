import { z } from "zod";

const NAME_REGEX = /^[a-zA-Z0-9_\- ]+$/;

export const roleParamsSchema = z.object({
	id: z.uuid(),
});

export const roleIdentityParamsSchema = z.object({
	id: z.uuid(),
	identityId: z.uuid(),
});

export const roleGroupParamsSchema = z.object({
	id: z.uuid(),
	groupId: z.uuid(),
});

export const rolePolicyParamsSchema = z.object({
	id: z.uuid(),
	policyId: z.uuid(),
});

export const createRoleSchema = z.object({
	name: z
		.string()
		.min(2)
		.max(64)
		.regex(NAME_REGEX, "Role name contains invalid characters"),
	description: z.string().min(1).max(255).optional(),
});

export const updateRoleSchema = z.object({
	name: z
		.string()
		.min(2)
		.max(64)
		.regex(NAME_REGEX, "Role name contains invalid characters")
		.optional(),
	description: z.string().min(1).max(255).optional(),
});

export const listRolesSchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(20),
	search: z.string().min(1).max(100).optional(),
});
