import { z } from "zod";

const addressEmbedSchema = z.object({
  line2: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().min(1),
  postal: z.string().optional(),
});

export const createSupplierSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  address: addressEmbedSchema.optional(),
  isActive: z.boolean().optional(),
});

export const updateSupplierSchema = z.object({
  name: z.string().min(1).optional(),
  code: z.string().min(1).optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  address: addressEmbedSchema.optional(),
  isActive: z.boolean().optional(),
});

const purchaseOrderItemSchema = z.object({
  variantId: z.string().min(1),
  quantityOrdered: z.number().int().positive(),
  unitCost: z.number().positive(),
});

export const createPurchaseOrderSchema = z.object({
  orderNumber: z.string().min(1),
  supplierId: z.string().min(1),
  warehouseId: z.string().min(1),
  expectedAt: z.coerce.date().optional(),
  notes: z.string().optional(),
  items: purchaseOrderItemSchema.array().min(1),
});

export const updatePurchaseOrderSchema = z.object({
  orderNumber: z.string().min(1).optional(),
  expectedAt: z.coerce.date().optional(),
  notes: z.string().optional(),
});

export const receiveItemsSchema = z.object({
  receipts: z
    .object({
      variantId: z.string().min(1),
      quantityReceived: z.number().int().positive(),
    })
    .array()
    .min(1),
  performedBy: z.string().min(1),
});

export const addItemToOrderSchema = z.object({
  variantId: z.string().min(1),
  quantityOrdered: z.number().int().positive(),
  unitCost: z.number().positive(),
});

export const updateOrderItemSchema = z.object({
  quantityOrdered: z.number().int().positive().optional(),
  unitCost: z.number().positive().optional(),
});
