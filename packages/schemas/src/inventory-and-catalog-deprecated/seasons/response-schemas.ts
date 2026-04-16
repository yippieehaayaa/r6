import type { z } from "zod";
import { SeasonSchema } from "./base-schemas";

export const SeasonResponseSchema = SeasonSchema;

export type SeasonResponse = z.infer<typeof SeasonResponseSchema>;
