import type { z } from "zod";
import {
  CreateInventoryItemSchema,
  CreateStockMovementSchema,
  CreateWarehouseSchema,
} from "./create-schemas";

export const UpdateWarehouseSchema = CreateWarehouseSchema.partial();
export const UpdateInventoryItemSchema = CreateInventoryItemSchema.partial();
export const UpdateStockMovementSchema = CreateStockMovementSchema.partial();

export type UpdateWarehouse = z.infer<typeof UpdateWarehouseSchema>;
export type UpdateInventoryItem = z.infer<typeof UpdateInventoryItemSchema>;
export type UpdateStockMovement = z.infer<typeof UpdateStockMovementSchema>;
