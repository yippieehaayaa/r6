import { z } from "zod";
import { slugRegex } from "../identity-and-access/base.schema";

export const AddressSchema = z.object({
  addressLine1: z.string().min(1).max(255),
  addressLine2: z.string().max(255).optional(),
  addressBarangay: z.string().max(100).optional(),
  addressCity: z.string().min(1).max(100),
  addressProvince: z.string().max(100).optional(),
  addressState: z.string().min(1).max(100),
  addressCountry: z.string().max(3).default("PH"),
  addressPostal: z.string().min(1).max(20),
  landmark: z.string().max(255).optional(),
});

export type Address = z.infer<typeof AddressSchema>;

export const ContactSchema = z.object({
  contactName: z.string().max(100).optional(),
  contactPhone: z.string().max(30).optional(),
  contactEmail: z.string().email().max(254).optional(),
});

export type Contact = z.infer<typeof ContactSchema>;

export const SlugSchema = z
  .string()
  .regex(slugRegex, "Must be a lowercase alphanumeric slug with hyphens")
  .min(2)
  .max(63);

export const DecimalStringSchema = z
  .string()
  .regex(/^-?\d+(\.\d+)?$/, "Must be a valid decimal string");

export const INVENTORY_PERMISSIONS = {
  SETUP_CREATE: "inventory:setup:create",
  SETUP_READ: "inventory:setup:read",

  CATALOG_CREATE: "inventory:catalog:create",
  CATALOG_READ: "inventory:catalog:read",
  CATALOG_UPDATE: "inventory:catalog:update",

  WAREHOUSE_CREATE: "inventory:warehouse:create",
  WAREHOUSE_READ: "inventory:warehouse:read",
  WAREHOUSE_UPDATE: "inventory:warehouse:update",

  STOCK_CREATE: "inventory:stock:create",
  STOCK_READ: "inventory:stock:read",
  STOCK_UPDATE: "inventory:stock:update",

  TRANSFER_CREATE: "inventory:transfer:create",
  TRANSFER_READ: "inventory:transfer:read",
  TRANSFER_UPDATE: "inventory:transfer:update",

  RETURN_CREATE: "inventory:return:create",
  RETURN_READ: "inventory:return:read",
  RETURN_UPDATE: "inventory:return:update",

  COUNT_CREATE: "inventory:count:create",
  COUNT_READ: "inventory:count:read",
  COUNT_UPDATE: "inventory:count:update",

  ALERT_READ: "inventory:alert:read",
  ALERT_UPDATE: "inventory:alert:update",
} as const;

export type InventoryPermission =
  (typeof INVENTORY_PERMISSIONS)[keyof typeof INVENTORY_PERMISSIONS];
