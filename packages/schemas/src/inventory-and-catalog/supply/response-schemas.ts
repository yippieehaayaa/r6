import type { z } from "zod";
import {
  PurchaseOrderItemSchema,
  PurchaseOrderSchema,
  SupplierSchema,
} from "./base-schemas";

export const SupplierResponseSchema = SupplierSchema;
export const PurchaseOrderResponseSchema = PurchaseOrderSchema;
export const PurchaseOrderItemResponseSchema = PurchaseOrderItemSchema;

export type SupplierResponse = z.infer<typeof SupplierResponseSchema>;
export type PurchaseOrderResponse = z.infer<typeof PurchaseOrderResponseSchema>;
export type PurchaseOrderItemResponse = z.infer<
  typeof PurchaseOrderItemResponseSchema
>;
