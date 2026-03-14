import { z } from "zod";

export const SeasonQuerySchema = z.union([
  z.strictObject({ id: z.string() }),
  z.strictObject({ name: z.string() }),
  z.strictObject({ slug: z.string() }),
]);

export type SeasonQuery = z.infer<typeof SeasonQuerySchema>;
