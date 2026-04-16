import { z } from "zod";

const dateTimeField = z
  .string()
  .refine((val) => !Number.isNaN(Date.parse(val)), "Invalid datetime");

export const CreateSeasonSchema = z.strictObject({
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  startDate: dateTimeField,
  endDate: dateTimeField,
  year: z.number().int(),
  isActive: z.boolean(),
});

export type CreateSeason = z.infer<typeof CreateSeasonSchema>;
