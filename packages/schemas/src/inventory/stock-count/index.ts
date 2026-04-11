import { z } from "zod";
import { UuidSchema } from "../base.schema";

// ── Prepare Stock Count ─────────────────────────────────────

const StockCountItemScopeSchema = z.object({
  variantId: UuidSchema,
  lotId: UuidSchema.optional(),
  binLocationId: UuidSchema.optional(),
});

export const PrepareStockCountSchema = z.object({
  warehouseId: UuidSchema,
  countType: z.enum(["CYCLE", "FULL", "SPOT"]).optional(),
  notes: z.string().max(500).optional(),
  items: z.array(StockCountItemScopeSchema).optional(),
});

export type PrepareStockCountInput = z.infer<typeof PrepareStockCountSchema>;

// ── Record Count ────────────────────────────────────────────

const RecordCountLineSchema = z.object({
  stockCountItemId: UuidSchema,
  quantityActual: z.number().int().nonnegative(),
});

export const RecordCountSchema = z.object({
  lines: z.array(RecordCountLineSchema).min(1),
});

export type RecordCountInput = z.infer<typeof RecordCountSchema>;

// ── Reconcile Stock Count ───────────────────────────────────

export const ReconcileStockCountSchema = z.object({
  supervisedBy: UuidSchema,
  varianceReasons: z.record(z.string(), z.string()).optional(),
});

export type ReconcileStockCountInput = z.infer<
  typeof ReconcileStockCountSchema
>;
