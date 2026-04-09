import type { z } from "zod";
import {
  InventoryItemEnrichedSchema,
  InventoryItemSchema,
  StockMovementSchema,
  WarehouseSchema,
} from "./base-schemas";

export const WarehouseResponseSchema = WarehouseSchema;
export const InventoryItemResponseSchema = InventoryItemSchema;
export const InventoryItemEnrichedResponseSchema = InventoryItemEnrichedSchema;
export const StockMovementResponseSchema = StockMovementSchema;

export type WarehouseResponse = z.infer<typeof WarehouseResponseSchema>;
export type InventoryItemResponse = z.infer<typeof InventoryItemResponseSchema>;
export type InventoryItemEnrichedResponse = z.infer<
  typeof InventoryItemEnrichedResponseSchema
>;
export type StockMovementResponse = z.infer<typeof StockMovementResponseSchema>;
