import { z } from "zod";

export const TimestampsSchema = z.strictObject({
	createdAt: z.string(),
	updatedAt: z.string(),
});

export const SoftDeleteSchema = z.strictObject({
	deletedAt: z.string().optional(),
});
