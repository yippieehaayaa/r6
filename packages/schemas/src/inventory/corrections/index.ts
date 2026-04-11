import { z } from "zod";
import { UuidSchema } from "../base.schema";

export const ManualAdjustmentSchema = z.object({
  variantId: UuidSchema,
  warehouseId: UuidSchema,
  quantityDelta: z
    .number()
    .int()
    .refine((n) => n !== 0, "Must be non-zero"),
  reason: z.string().min(1).max(500),
});

export type ManualAdjustmentInput = z.infer<typeof ManualAdjustmentSchema>;

export const WriteOffStockSchema = z.object({
  lotId: UuidSchema,
  reason: z.string().min(1).max(500),
});

export type WriteOffStockInput = z.infer<typeof WriteOffStockSchema>;
