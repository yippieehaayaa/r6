import type { z } from "zod";
import { CreateSeasonSchema } from "./create-schemas";

export const UpdateSeasonSchema = CreateSeasonSchema.partial();

export type UpdateSeason = z.infer<typeof UpdateSeasonSchema>;
