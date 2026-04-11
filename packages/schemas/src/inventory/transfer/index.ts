import { z } from "zod";
import { UuidSchema } from "../base.schema";

// ── Dispatch Transfer ───────────────────────────────────────

const DispatchTransferLineSchema = z.object({
  variantId: UuidSchema,
  quantity: z.number().int().positive(),
});

export const DispatchTransferSchema = z.object({
  fromWarehouseId: UuidSchema,
  toWarehouseId: UuidSchema,
  expectedAt: z.coerce.date().optional(),
  notes: z.string().max(500).optional(),
  lines: z.array(DispatchTransferLineSchema).min(1),
});

export type DispatchTransferInput = z.infer<typeof DispatchTransferSchema>;

// ── Receive Transfer ────────────────────────────────────────

const ReceiveTransferLineSchema = z.object({
  transferItemId: UuidSchema,
  quantityReceived: z.number().int().nonnegative(),
});

export const ReceiveTransferSchema = z.object({
  lines: z.array(ReceiveTransferLineSchema).min(1),
});

export type ReceiveTransferInput = z.infer<typeof ReceiveTransferSchema>;
