import { z } from "zod";
import {
  PriceSchema,
  SoftDeleteSchema,
  TimestampsSchema,
} from "../base-schemas";
import {
  DimensionUnitSchema,
  ProductStatusSchema,
  WeightUnitSchema,
} from "./enums";

// ─── Shared Embedded Types ────────────────────────────────────────────────────

export const ImageEmbedSchema = z.strictObject({
  url: z.string(),
  altText: z.string().optional(),
  isPrimary: z.boolean(),
  sortOrder: z.number().int(),
});

// ─── Model Base Schemas ───────────────────────────────────────────────────────

export const CategorySchema = z.strictObject({
  id: z.string().readonly(),
  tenantSlug: z.string().readonly(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullish(),
  parentId: z.string().readonly().nullish(),
  isActive: z.boolean(),
  sortOrder: z.number().int(),
  ...TimestampsSchema.shape,
  ...SoftDeleteSchema.shape,
});

export const BrandSchema = z.strictObject({
  id: z.string().readonly(),
  tenantSlug: z.string().readonly(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullish(),
  logoUrl: z.string().nullish(),
  isActive: z.boolean(),
  ...TimestampsSchema.shape,
  ...SoftDeleteSchema.shape,
});

export const ProductSchema = z.strictObject({
  id: z.string().readonly(),
  tenantSlug: z.string().readonly(),
  sku: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullish(),
  tags: z.string().array(),
  status: ProductStatusSchema,
  metadata: z.unknown().nullish(),
  categoryId: z.string().readonly(),
  brandId: z.string().readonly().nullish(),
  ...TimestampsSchema.shape,
  ...SoftDeleteSchema.shape,
});

export const ProductVariantSchema = z.strictObject({
  id: z.string().readonly(),
  tenantSlug: z.string().readonly(),
  sku: z.string(),
  name: z.string(),
  options: z.unknown(),
  price: PriceSchema,
  costPrice: PriceSchema.nullish(),
  compareAtPrice: PriceSchema.nullish(),
  weight: z.number().nullish(),
  length: z.number().nullish(),
  width: z.number().nullish(),
  height: z.number().nullish(),
  dimensionUnit: DimensionUnitSchema.nullish(),
  weightUnit: WeightUnitSchema.nullish(),
  currency: z.string(),
  images: ImageEmbedSchema.array(),
  isActive: z.boolean(),
  productId: z.string().readonly(),
  ...TimestampsSchema.shape,
  ...SoftDeleteSchema.shape,
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type ImageEmbed = z.infer<typeof ImageEmbedSchema>;
export type Category = z.infer<typeof CategorySchema>;
export type Brand = z.infer<typeof BrandSchema>;
export type Product = z.infer<typeof ProductSchema>;
export type ProductVariant = z.infer<typeof ProductVariantSchema>;
