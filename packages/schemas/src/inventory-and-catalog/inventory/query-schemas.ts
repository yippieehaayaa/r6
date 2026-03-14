import { z } from "zod";

export const WarehouseQuerySchema = z.union([
  z.strictObject({ id: z.string() }),
  z.strictObject({ name: z.string() }),
  z.strictObject({ code: z.string() }),
]);

export const InventoryItemQuerySchema = z.union([
  z.strictObject({ id: z.string() }),
  z.strictObject({ variantId: z.string(), warehouseId: z.string() }),
]);

export const StockMovementQuerySchema = z.strictObject({ id: z.string() });

export type WarehouseQuery = z.infer<typeof WarehouseQuerySchema>;
export type InventoryItemQuery = z.infer<typeof InventoryItemQuerySchema>;
export type StockMovementQuery = z.infer<typeof StockMovementQuerySchema>;
