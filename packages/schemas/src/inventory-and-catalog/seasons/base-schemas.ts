import { z } from "zod";
import { SoftDeleteSchema, TimestampsSchema } from "../base-schemas";

const dateTimeField = z
  .string()
  .refine((val) => !Number.isNaN(Date.parse(val)), "Invalid datetime");

export const SeasonSchema = z.strictObject({
  id: z.string().readonly(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  startDate: dateTimeField,
  endDate: dateTimeField,
  year: z.number().int(),
  isActive: z.boolean(),
  ...TimestampsSchema.shape,
  ...SoftDeleteSchema.shape,
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type Season = z.infer<typeof SeasonSchema>;
