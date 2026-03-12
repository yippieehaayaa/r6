import { z } from "zod";

export const MovementTypeSchema = z.enum([
  "RECEIPT",
  "SALE",
  "ADJUSTMENT",
  "TRANSFER_IN",
  "TRANSFER_OUT",
  "RETURN",
  "DAMAGE",
]);

export type MovementType = z.infer<typeof MovementTypeSchema>;
