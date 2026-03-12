import { z } from "zod";
import {
  AddressEmbedSchema,
  SoftDeleteSchema,
  TimestampsSchema,
} from "../base-schemas";
import { MovementTypeSchema } from "./enums";
// ─── Model Base Schemas ───────────────────────────────────────────────────────

export const WarehouseSchema = z.strictObject({
  id: z.string().readonly(),
  name: z.string(),
  code: z.string(),
  address: AddressEmbedSchema.optional(),
  isActive: z.boolean(),
  ...TimestampsSchema.shape,
  ...SoftDeleteSchema.shape,
});

// InventoryItem has no createdAt — only updatedAt
export const InventoryItemSchema = z.strictObject({
  id: z.string().readonly(),
  quantityOnHand: z.number().int(),
  quantityReserved: z.number().int(),
  reorderPoint: z.number().int(),
  reorderQuantity: z.number().int(),
  variantId: z.string().readonly(),
  warehouseId: z.string().readonly(),
  updatedAt: z.string(),
});

// StockMovement is append-only — only createdAt
export const StockMovementSchema = z.strictObject({
  id: z.string().readonly(),
  type: MovementTypeSchema,
  quantity: z.number().int(),
  referenceId: z.string().optional(),
  referenceType: z.string().optional(),
  notes: z.string().optional(),
  performedBy: z.string(),
  variantId: z.string().readonly(),
  warehouseId: z.string().readonly(),
  createdAt: z.string(),
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type Warehouse = z.infer<typeof WarehouseSchema>;
export type InventoryItem = z.infer<typeof InventoryItemSchema>;
export type StockMovement = z.infer<typeof StockMovementSchema>;
