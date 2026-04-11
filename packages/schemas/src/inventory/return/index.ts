import { z } from "zod";
import { UuidSchema } from "../base.schema";
import { ReturnDispositionSchema } from "../enums.schema";

// ── Request Return ──────────────────────────────────────────

const RequestReturnLineSchema = z.object({
  variantId: UuidSchema,
  quantityReturned: z.number().int().positive(),
  disposition: ReturnDispositionSchema,
  lotId: UuidSchema.optional(),
  serialNumber: z.string().max(100).optional(),
  dispositionNotes: z.string().max(500).optional(),
});

export const RequestReturnSchema = z.object({
  referenceId: z.string().min(1),
  referenceType: z.string().min(1).max(50),
  returnReason: z.string().max(500).optional(),
  lines: z.array(RequestReturnLineSchema).min(1),
});

export type RequestReturnInput = z.infer<typeof RequestReturnSchema>;

// ── Receive Return ──────────────────────────────────────────

const ReceiveReturnLineSchema = z.object({
  returnRequestItemId: UuidSchema,
  disposition: ReturnDispositionSchema.optional(),
  dispositionNotes: z.string().max(500).optional(),
});

export const ReceiveReturnSchema = z.object({
  lines: z.array(ReceiveReturnLineSchema).min(1),
});

export type ReceiveReturnInput = z.infer<typeof ReceiveReturnSchema>;

// ── Process Disposition ─────────────────────────────────────

export const ProcessReturnDispositionSchema = z.object({
  warehouseId: UuidSchema,
});

export type ProcessReturnDispositionInput = z.infer<
  typeof ProcessReturnDispositionSchema
>;
