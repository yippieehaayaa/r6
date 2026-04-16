import { z } from "zod";

export const TransferItemSchema = z.object({
  id: z.string(),
  transferId: z.string(),
  variantId: z.string(),
  quantityDispatched: z.number(),
  quantityReceived: z.number().nullable(),
  createdAt: z.string(),
});

export type TransferItem = z.infer<typeof TransferItemSchema>;

export const StockTransferSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  fromWarehouseId: z.string(),
  toWarehouseId: z.string(),
  status: z.string(),
  dispatchedBy: z.string(),
  dispatchedAt: z.string().nullable(),
  expectedAt: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type StockTransfer = z.infer<typeof StockTransferSchema>;

export const StockTransferDetailSchema = StockTransferSchema.extend({
  items: z.array(TransferItemSchema),
});

export type StockTransferDetail = z.infer<typeof StockTransferDetailSchema>;
