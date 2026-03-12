import type { z } from "zod";
import {
  InventoryItemSchema,
  StockMovementSchema,
  WarehouseSchema,
} from "./base-schemas";

export const UpdateWarehouseSchema = WarehouseSchema.partial();
export const UpdateInventoryItemSchema = InventoryItemSchema.partial();
export const UpdateStockMovementSchema = StockMovementSchema.partial();

export type UpdateWarehouse = z.infer<typeof UpdateWarehouseSchema>;
export type UpdateInventoryItem = z.infer<typeof UpdateInventoryItemSchema>;
export type UpdateStockMovement = z.infer<typeof UpdateStockMovementSchema>;
