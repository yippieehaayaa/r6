import { z } from "zod";
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

export const StockCountsSchema = z.object({
  total: z.number().int(),
  inStock: z.number().int(),
  lowStock: z.number().int(),
  outOfStock: z.number().int(),
  totalUnitsOnHand: z.number().int(),
  totalUnitsReserved: z.number().int(),
  totalUnitsAvailable: z.number().int(),
});

export type WarehouseResponse = z.infer<typeof WarehouseResponseSchema>;
export type InventoryItemResponse = z.infer<typeof InventoryItemResponseSchema>;
export type InventoryItemEnrichedResponse = z.infer<
  typeof InventoryItemEnrichedResponseSchema
>;
export type StockMovementResponse = z.infer<typeof StockMovementResponseSchema>;
export type StockCounts = z.infer<typeof StockCountsSchema>;
