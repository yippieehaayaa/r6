import { z } from "zod";

export const StockAlertSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  alertType: z.string(),
  status: z.string(),
  variantId: z.string().nullable(),
  warehouseId: z.string().nullable(),
  lotId: z.string().nullable(),
  threshold: z.number().nullable(),
  currentValue: z.number().nullable(),
  notes: z.string().nullable(),
  acknowledgedBy: z.string().nullable(),
  acknowledgedAt: z.string().nullable(),
  resolvedBy: z.string().nullable(),
  resolvedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type StockAlert = z.infer<typeof StockAlertSchema>;
