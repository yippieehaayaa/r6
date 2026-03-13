import { z } from "zod";

const imageEmbedSchema = z.object({
  url: z.string().min(1),
  altText: z.string().optional(),
  isPrimary: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});

const dimensionUnitSchema = z.enum(["CM", "MM", "IN", "FT", "M"]);
const weightUnitSchema = z.enum(["G", "KG", "LB", "OZ"]);
const productStatusSchema = z.enum([
  "DRAFT",
  "ACTIVE",
  "DISCONTINUED",
  "ARCHIVED",
]);

export const createCategorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  parentId: z.string().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  parentId: z.string().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const createBrandSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  logoUrl: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const updateBrandSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  logoUrl: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const createProductSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  tags: z.string().array().optional(),
  status: productStatusSchema.optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  categoryId: z.string().min(1),
  brandId: z.string().optional(),
});

export const updateProductSchema = z.object({
  sku: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  tags: z.string().array().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
});

export const createVariantSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  options: z.record(z.string(), z.string()),
  price: z.number().positive(),
  costPrice: z.number().optional(),
  compareAtPrice: z.number().optional(),
  weight: z.number().optional(),
  length: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  dimensionUnit: dimensionUnitSchema.optional(),
  weightUnit: weightUnitSchema.optional(),
  currency: z.string().optional(),
  images: imageEmbedSchema.array().optional(),
  isActive: z.boolean().optional(),
});

export const updateVariantSchema = z.object({
  sku: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  options: z.record(z.string(), z.string()).optional(),
  price: z.number().positive().optional(),
  costPrice: z.number().optional(),
  compareAtPrice: z.number().optional(),
  weight: z.number().optional(),
  length: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  dimensionUnit: dimensionUnitSchema.optional(),
  weightUnit: weightUnitSchema.optional(),
  currency: z.string().optional(),
  images: imageEmbedSchema.array().optional(),
  isActive: z.boolean().optional(),
});
