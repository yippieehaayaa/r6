import { z } from "zod";
import { UuidSchema } from "../base.schema";

const ReceiveStockLineSchema = z.object({
  variantId: UuidSchema,
  warehouseId: UuidSchema,
  binLocationId: UuidSchema.optional(),
  quantityReceived: z.number().int().positive(),
  unitCost: z
    .string()
    .regex(/^\d+(\.\d+)?$/, "Must be a non-negative decimal string"),
  unitCostCurrency: z.string().length(3).optional(),
  lotNumber: z.string().max(100).optional(),
  expiresAt: z.coerce.date().optional(),
  manufacturedAt: z.coerce.date().optional(),
  notes: z.string().max(500).optional(),
  serialNumbers: z.array(z.string().min(1).max(100)).optional(),
});

export const ReceiveStockSchema = z.object({
  referenceId: z.string().min(1),
  referenceType: z.string().max(50).optional(),
  receivedAt: z.coerce.date(),
  lines: z.array(ReceiveStockLineSchema).min(1),
});

export type ReceiveStockInput = z.infer<typeof ReceiveStockSchema>;
