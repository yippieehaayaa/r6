import { z } from "zod";

export const MovementTypeSchema = z.enum([
  "RECEIPT",
  "SALE",
  "ADJUSTMENT",
  "TRANSFER_IN",
  "TRANSFER_OUT",
  "RETURN",
  "DAMAGE",
  "RESERVATION",
  "RESERVATION_RELEASE",
]);

export type MovementType = z.infer<typeof MovementTypeSchema>;
