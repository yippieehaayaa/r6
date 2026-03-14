import { z } from "zod";

const addressEmbedSchema = z.object({
  line2: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().min(1),
  postal: z.string().optional(),
});

const movementTypeSchema = z.enum([
  "RECEIPT",
  "SALE",
  "ADJUSTMENT",
  "TRANSFER_IN",
  "TRANSFER_OUT",
  "RETURN",
  "DAMAGE",
]);

export const createWarehouseSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  address: addressEmbedSchema.optional(),
  isActive: z.boolean().optional(),
});

export const updateWarehouseSchema = z.object({
  name: z.string().min(1).optional(),
  code: z.string().min(1).optional(),
  address: addressEmbedSchema.optional(),
  isActive: z.boolean().optional(),
});

export const reserveStockSchema = z.object({
  variantId: z.string().min(1),
  warehouseId: z.string().min(1),
  qty: z.number().int().positive(),
  performedBy: z.string().min(1),
});

export const releaseReservationSchema = z.object({
  variantId: z.string().min(1),
  warehouseId: z.string().min(1),
  qty: z.number().int().positive(),
  performedBy: z.string().min(1),
});

export const commitSaleSchema = z.object({
  variantId: z.string().min(1),
  warehouseId: z.string().min(1),
  qty: z.number().int().positive(),
  referenceId: z.string().min(1),
  performedBy: z.string().min(1),
});

export const adjustStockSchema = z.object({
  variantId: z.string().min(1),
  warehouseId: z.string().min(1),
  delta: z.number().int(),
  notes: z.string().min(1),
  performedBy: z.string().min(1),
});

export const transferStockSchema = z.object({
  variantId: z.string().min(1),
  fromWarehouseId: z.string().min(1),
  toWarehouseId: z.string().min(1),
  qty: z.number().int().positive(),
  performedBy: z.string().min(1),
});

export const recordDamageSchema = z.object({
  variantId: z.string().min(1),
  warehouseId: z.string().min(1),
  qty: z.number().int().positive(),
  notes: z.string().min(1),
  performedBy: z.string().min(1),
});

export { movementTypeSchema };
