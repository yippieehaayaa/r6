import { z } from "zod";

const NAME_REGEX = /^[a-zA-Z0-9_\- ]+$/;

export const groupParamsSchema = z.object({
	id: z.uuid(),
});

export const groupMembershipParamsSchema = z.object({
	id: z.uuid(),
	identityId: z.uuid(),
});

export const groupRoleParamsSchema = z.object({
	id: z.uuid(),
	roleId: z.uuid(),
});

export const createGroupSchema = z.object({
	name: z
		.string()
		.min(2)
		.max(64)
		.regex(NAME_REGEX, "Group name contains invalid characters"),
	description: z.string().min(1).max(255).optional(),
});

export const updateGroupSchema = z.object({
	name: z
		.string()
		.min(2)
		.max(64)
		.regex(NAME_REGEX, "Group name contains invalid characters")
		.optional(),
	description: z.string().min(1).max(255).optional(),
});

export const listGroupsSchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(20),
	search: z.string().min(1).max(100).optional(),
});
