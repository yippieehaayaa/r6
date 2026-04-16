import { z } from "zod";

export const AlertActionSchema = z.object({
  notes: z.string().max(500).optional(),
});

export type AlertActionInput = z.infer<typeof AlertActionSchema>;
