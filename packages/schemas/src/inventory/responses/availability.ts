import { z } from "zod";

export const AvailabilityResultSchema = z.object({
  variantId: z.string(),
  warehouseId: z.string(),
  quantityOnHand: z.number(),
  quantityReserved: z.number(),
  quantityAvailable: z.number(),
});

export type AvailabilityResult = z.infer<typeof AvailabilityResultSchema>;

export const AvailabilityBatchResultSchema = z.object({
  items: z.array(AvailabilityResultSchema),
});

export type AvailabilityBatchResult = z.infer<
  typeof AvailabilityBatchResultSchema
>;
