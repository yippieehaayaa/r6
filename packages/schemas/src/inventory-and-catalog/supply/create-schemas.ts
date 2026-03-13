import { z } from "zod";
import { AddressEmbedSchema, PriceSchema } from "../base-schemas";
import { PurchaseOrderStatusSchema } from "./enums";

const dateTimeField = z
  .string()
  .refine((val) => !Number.isNaN(Date.parse(val)), "Invalid datetime");

export const CreateSupplierSchema = z.strictObject({
  name: z.string(),
  code: z.string(),
  contactName: z.string().optional(),
  contactEmail: z.string().optional(),
  contactPhone: z.string().optional(),
  address: AddressEmbedSchema.optional(),
  isActive: z.boolean(),
});

export const CreatePurchaseOrderSchema = z.strictObject({
  orderNumber: z.string(),
  status: PurchaseOrderStatusSchema,
  expectedAt: dateTimeField.optional(),
  notes: z.string().optional(),
  supplierId: z.string(),
  warehouseId: z.string(),
});

export const CreatePurchaseOrderItemSchema = z.strictObject({
  quantityOrdered: z.number().int(),
  quantityReceived: z.number().int(),
  unitCost: PriceSchema,
  purchaseOrderId: z.string(),
  variantId: z.string(),
});

export type CreateSupplier = z.infer<typeof CreateSupplierSchema>;
export type CreatePurchaseOrder = z.infer<typeof CreatePurchaseOrderSchema>;
export type CreatePurchaseOrderItem = z.infer<
  typeof CreatePurchaseOrderItemSchema
>;
