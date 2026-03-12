import { z } from "zod";
import {
  AddressEmbedSchema,
  SoftDeleteSchema,
  TimestampsSchema,
} from "../base-schemas";
import { PurchaseOrderStatusSchema } from "./enums";

const dateTimeField = z
  .string()
  .refine((val) => !Number.isNaN(Date.parse(val)), "Invalid datetime");

// ─── Model Base Schemas ────────────────────────────────────────────────────────

export const SupplierSchema = z.strictObject({
  id: z.string().readonly(),
  name: z.string(),
  code: z.string(),
  contactName: z.string().optional(),
  contactEmail: z.string().optional(),
  contactPhone: z.string().optional(),
  address: AddressEmbedSchema.optional(),
  isActive: z.boolean(),
  ...TimestampsSchema.shape,
  ...SoftDeleteSchema.shape,
});

export const PurchaseOrderSchema = z.strictObject({
  id: z.string().readonly(),
  orderNumber: z.string(),
  status: PurchaseOrderStatusSchema,
  expectedAt: dateTimeField.optional(),
  notes: z.string().optional(),
  supplierId: z.string().readonly(),
  warehouseId: z.string().readonly(),
  ...TimestampsSchema.shape,
  ...SoftDeleteSchema.shape,
});

export const PurchaseOrderItemSchema = z.strictObject({
  id: z.string().readonly(),
  quantityOrdered: z.number().int(),
  quantityReceived: z.number().int(),
  unitCost: z.number(),
  purchaseOrderId: z.string().readonly(),
  variantId: z.string().readonly(),
  ...TimestampsSchema.shape,
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type Supplier = z.infer<typeof SupplierSchema>;
export type PurchaseOrder = z.infer<typeof PurchaseOrderSchema>;
export type PurchaseOrderItem = z.infer<typeof PurchaseOrderItemSchema>;
