import { z } from "zod";
import { SoftDeleteSchema, TimestampsSchema } from "../base-schemas";
import { DimensionUnitSchema, ProductStatusSchema, WeightUnitSchema } from "./enums";

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
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  parentId: z.string().readonly().optional(),
  isActive: z.boolean(),
  sortOrder: z.number().int(),
  ...TimestampsSchema.shape,
  ...SoftDeleteSchema.shape,
});

export const BrandSchema = z.strictObject({
  id: z.string().readonly(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  logoUrl: z.string().optional(),
  isActive: z.boolean(),
  ...TimestampsSchema.shape,
  ...SoftDeleteSchema.shape,
});

export const ProductSchema = z.strictObject({
  id: z.string().readonly(),
  sku: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  tags: z.string().array(),
  status: ProductStatusSchema,
  metadata: z.unknown().optional(),
  categoryId: z.string().readonly(),
  brandId: z.string().readonly().optional(),
  ...TimestampsSchema.shape,
  ...SoftDeleteSchema.shape,
});

export const ProductVariantSchema = z.strictObject({
  id: z.string().readonly(),
  sku: z.string(),
  name: z.string(),
  options: z.unknown(),
  price: z.number(),
  costPrice: z.number().optional(),
  compareAtPrice: z.number().optional(),
  weight: z.number().optional(),
  length: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  dimensionUnit: DimensionUnitSchema.optional(),
  weightUnit: WeightUnitSchema.optional(),
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
