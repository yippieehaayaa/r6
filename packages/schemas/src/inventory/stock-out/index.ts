import { z } from "zod";
import { UuidSchema } from "../base.schema";

// ── Reserve Stock ───────────────────────────────────────────

const ReserveStockLineSchema = z.object({
  variantId: UuidSchema,
  warehouseId: UuidSchema,
  quantity: z.number().int().positive(),
});

export const ReserveStockSchema = z.object({
  referenceId: z.string().min(1),
  referenceType: z.string().min(1).max(50),
  lines: z.array(ReserveStockLineSchema).min(1),
});

export type ReserveStockInput = z.infer<typeof ReserveStockSchema>;

// ── Fulfill Sale ────────────────────────────────────────────

const FulfillSaleLineSchema = z.object({
  variantId: UuidSchema,
  warehouseId: UuidSchema,
  quantity: z.number().int().positive(),
  reservationId: UuidSchema.optional(),
  serialNumbers: z.array(z.string().min(1).max(100)).optional(),
});

export const FulfillSaleSchema = z.object({
  referenceId: z.string().min(1),
  referenceType: z.string().max(50).optional(),
  lines: z.array(FulfillSaleLineSchema).min(1),
});

export type FulfillSaleInput = z.infer<typeof FulfillSaleSchema>;
