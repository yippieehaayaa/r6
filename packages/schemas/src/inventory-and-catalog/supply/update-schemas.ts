import type { z } from "zod";
import {
  CreatePurchaseOrderItemSchema,
  CreatePurchaseOrderSchema,
  CreateSupplierSchema,
} from "./create-schemas";

export const UpdateSupplierSchema = CreateSupplierSchema.partial();
export const UpdatePurchaseOrderSchema = CreatePurchaseOrderSchema.partial();
export const UpdatePurchaseOrderItemSchema =
  CreatePurchaseOrderItemSchema.partial();

export type UpdateSupplier = z.infer<typeof UpdateSupplierSchema>;
export type UpdatePurchaseOrder = z.infer<typeof UpdatePurchaseOrderSchema>;
export type UpdatePurchaseOrderItem = z.infer<
  typeof UpdatePurchaseOrderItemSchema
>;
