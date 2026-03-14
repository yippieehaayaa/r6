import { z } from "zod";

export const SupplierQuerySchema = z.union([
  z.strictObject({ id: z.string() }),
  z.strictObject({ name: z.string() }),
  z.strictObject({ code: z.string() }),
]);

export const PurchaseOrderQuerySchema = z.union([
  z.strictObject({ id: z.string() }),
  z.strictObject({ orderNumber: z.string() }),
]);

export const PurchaseOrderItemQuerySchema = z.union([
  z.strictObject({ id: z.string() }),
  z.strictObject({ purchaseOrderId: z.string(), variantId: z.string() }),
]);

export type SupplierQuery = z.infer<typeof SupplierQuerySchema>;
export type PurchaseOrderQuery = z.infer<typeof PurchaseOrderQuerySchema>;
export type PurchaseOrderItemQuery = z.infer<
  typeof PurchaseOrderItemQuerySchema
>;
