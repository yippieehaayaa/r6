import { z } from "zod";

export const BinLocationSchema = z.object({
  id: z.string(),
  code: z.string(),
  description: z.string().nullable(),
});

export type BinLocation = z.infer<typeof BinLocationSchema>;

export const WarehouseZoneSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  description: z.string().nullable(),
  bins: z.array(BinLocationSchema),
});

export type WarehouseZone = z.infer<typeof WarehouseZoneSchema>;

export const WarehouseSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  name: z.string(),
  code: z.string(),
  isActive: z.boolean(),
  addressLine1: z.string(),
  addressLine2: z.string().nullable(),
  addressCity: z.string(),
  addressState: z.string(),
  addressCountry: z.string(),
  addressPostal: z.string(),
  contactName: z.string().nullable(),
  contactPhone: z.string().nullable(),
  contactEmail: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Warehouse = z.infer<typeof WarehouseSchema>;

export const WarehouseDetailSchema = WarehouseSchema.extend({
  zones: z.array(WarehouseZoneSchema),
});

export type WarehouseDetail = z.infer<typeof WarehouseDetailSchema>;
