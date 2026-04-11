import { z } from "zod";
import { UuidSchema } from "../base.schema";

export const CheckAvailabilityQuerySchema = z.object({
  variantId: UuidSchema,
  warehouseId: UuidSchema,
});

export type CheckAvailabilityQuery = z.infer<
  typeof CheckAvailabilityQuerySchema
>;

const AvailabilityItemSchema = z.object({
  variantId: UuidSchema,
  warehouseId: UuidSchema,
});

export const CheckAvailabilityBatchSchema = z.object({
  items: z.array(AvailabilityItemSchema).min(1).max(100),
});

export type CheckAvailabilityBatchInput = z.infer<
  typeof CheckAvailabilityBatchSchema
>;
