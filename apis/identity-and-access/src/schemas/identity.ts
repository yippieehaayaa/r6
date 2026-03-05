import { z } from "zod";

const USERNAME_REGEX = /^[a-zA-Z][a-zA-Z0-9_-]{2,31}$/;
const PASSWORD_REGEX =
	/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

export const identityParamsSchema = z.object({
	id: z.uuid(),
});

export const createIdentitySchema = z.object({
	username: z
		.string()
		.min(3)
		.max(32)
		.regex(
			USERNAME_REGEX,
			"Username must start with a letter and contain only letters, numbers, underscores, or hyphens",
		),
	email: z.email().optional(),
	password: z
		.string()
		.min(8)
		.max(128)
		.regex(
			PASSWORD_REGEX,
			"Password must contain uppercase, lowercase, number, and special character",
		),
	kind: z.enum(["USER", "SERVICE", "ADMIN"]).optional(),
	status: z
		.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING_VERIFICATION"])
		.optional(),
});

export const verifyIdentitySchema = z.object({
	username: z.string().min(1).max(32),
	password: z.string().min(1).max(128),
	ipAddress: z.ipv4().or(z.ipv6()).optional(),
	userAgent: z.string().max(512).optional(),
});

export const changePasswordSchema = z
	.object({
		currentPassword: z.string().min(1).max(128),
		newPassword: z
			.string()
			.min(8)
			.max(128)
			.regex(
				PASSWORD_REGEX,
				"Password must contain uppercase, lowercase, number, and special character",
			),
		confirmNewPassword: z.string().min(1).max(128),
	})
	.refine((data) => data.newPassword === data.confirmNewPassword, {
		message: "Passwords do not match",
		path: ["confirmNewPassword"],
	})
	.refine((data) => data.currentPassword !== data.newPassword, {
		message: "New password must differ from current password",
		path: ["newPassword"],
	});

export const changeEmailSchema = z.object({
	newEmail: z.email(),
	ipAddress: z.ipv4().or(z.ipv6()).optional(),
});

export const updateIdentitySchema = z.object({
	status: z
		.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING_VERIFICATION"])
		.optional(),
	kind: z.enum(["USER", "SERVICE", "ADMIN"]).optional(),
	active: z.boolean().optional(),
});

export const listIdentitiesSchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(20),
	search: z.string().min(1).max(100).optional(),
	status: z
		.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING_VERIFICATION"])
		.optional(),
	kind: z.enum(["USER", "SERVICE", "ADMIN"]).optional(),
	searchField: z.enum(["username", "email"]).optional(),
});
