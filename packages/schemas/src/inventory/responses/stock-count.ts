import { z } from "zod";

export const StockCountItemSchema = z.object({
  id: z.string(),
  stockCountId: z.string(),
  variantId: z.string(),
  lotId: z.string().nullable(),
  binLocationId: z.string().nullable(),
  quantityExpected: z.number(),
  quantityActual: z.number().nullable(),
  variance: z.number().nullable(),
  countedBy: z.string().nullable(),
  countedAt: z.string().nullable(),
});

export type StockCountItem = z.infer<typeof StockCountItemSchema>;

export const StockCountSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  warehouseId: z.string(),
  status: z.string(),
  countType: z.string(),
  notes: z.string().nullable(),
  performedBy: z.string(),
  supervisedBy: z.string().nullable(),
  startedAt: z.string().nullable(),
  completedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type StockCount = z.infer<typeof StockCountSchema>;

export const StockCountDetailSchema = StockCountSchema.extend({
  items: z.array(StockCountItemSchema),
});

export type StockCountDetail = z.infer<typeof StockCountDetailSchema>;
