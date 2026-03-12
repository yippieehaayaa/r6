import { z } from "zod";
import { AddressEmbedSchema } from "./base-schemas";
import { MovementTypeSchema } from "./enums";

export const CreateWarehouseSchema = z.strictObject({
  name: z.string(),
  code: z.string(),
  address: AddressEmbedSchema.optional(),
  isActive: z.boolean(),
});

export const CreateInventoryItemSchema = z.strictObject({
  quantityOnHand: z.number().int(),
  quantityReserved: z.number().int(),
  reorderPoint: z.number().int(),
  reorderQuantity: z.number().int(),
  variantId: z.string(),
  warehouseId: z.string(),
});

export const CreateStockMovementSchema = z.strictObject({
  type: MovementTypeSchema,
  quantity: z.number().int(),
  referenceId: z.string().optional(),
  referenceType: z.string().optional(),
  notes: z.string().optional(),
  performedBy: z.string(),
  variantId: z.string(),
  warehouseId: z.string(),
});

export type CreateWarehouse = z.infer<typeof CreateWarehouseSchema>;
export type CreateInventoryItem = z.infer<typeof CreateInventoryItemSchema>;
export type CreateStockMovement = z.infer<typeof CreateStockMovementSchema>;
