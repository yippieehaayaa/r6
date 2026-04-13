import { z } from "zod";

// ── Shared Nested Refs ──────────────────────────────────────

const CategoryRefSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
});

const BrandRefSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
});

export const UomRefSchema = z.object({
  id: z.string(),
  name: z.string(),
  abbreviation: z.string(),
});

export type UomRef = z.infer<typeof UomRefSchema>;

const ProductRefSchema = z.object({
  id: z.string(),
  sku: z.string(),
  name: z.string(),
  slug: z.string(),
  status: z.string(),
});

const ProductDetailRefSchema = ProductRefSchema.extend({
  categoryId: z.string().nullable(),
  brandId: z.string().nullable(),
  category: z.object({ id: z.string(), name: z.string() }).nullable(),
  brand: z.object({ id: z.string(), name: z.string() }).nullable(),
});

const ProductVariantSummarySchema = z.object({
  id: z.string(),
  sku: z.string(),
  name: z.string(),
  barcode: z.string().nullable(),
  options: z.record(z.string(), z.unknown()),
  trackingType: z.string(),
  isActive: z.boolean(),
  imageUrl: z.string().nullable(),
  baseUom: UomRefSchema.nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// ── Product Responses ───────────────────────────────────────

export const ProductSummarySchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  sku: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  tags: z.array(z.string()),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  status: z.string(),
  categoryId: z.string().nullable(),
  brandId: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  category: CategoryRefSchema.nullable(),
  brand: BrandRefSchema.nullable(),
  _count: z.object({ variants: z.number() }),
});

export type ProductSummary = z.infer<typeof ProductSummarySchema>;

export const ProductDetailSchema = ProductSummarySchema.omit({
  _count: true,
}).extend({
  variants: z.array(ProductVariantSummarySchema),
});

export type ProductDetail = z.infer<typeof ProductDetailSchema>;

// ── Variant Responses ───────────────────────────────────────

const VariantBaseSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  productId: z.string(),
  sku: z.string(),
  name: z.string(),
  barcode: z.string().nullable(),
  options: z.record(z.string(), z.unknown()),
  trackingType: z.string(),
  weight: z.string().nullable(),
  length: z.string().nullable(),
  width: z.string().nullable(),
  height: z.string().nullable(),
  dimensionUnit: z.string().nullable(),
  weightUnit: z.string().nullable(),
  imageUrl: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  isActive: z.boolean(),
  baseUomId: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  baseUom: UomRefSchema.nullable(),
});

export const VariantSummarySchema = VariantBaseSchema.extend({
  product: ProductRefSchema.nullable(),
});

export type VariantSummary = z.infer<typeof VariantSummarySchema>;

export const VariantDetailSchema = VariantBaseSchema.extend({
  product: ProductDetailRefSchema.nullable(),
});

export type VariantDetail = z.infer<typeof VariantDetailSchema>;

// ── Brand Response ──────────────────────────────────────────

export const BrandSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  logoUrl: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  _count: z.object({ products: z.number() }),
});

export type Brand = z.infer<typeof BrandSchema>;

// ── Category Response ───────────────────────────────────────

export const CategorySchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  parentId: z.string().nullable(),
  path: z.string(),
  sortOrder: z.number(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  parent: CategoryRefSchema.nullable(),
  _count: z.object({ children: z.number(), products: z.number() }),
});

export type Category = z.infer<typeof CategorySchema>;

// ── UOM Response ────────────────────────────────────────────

export const UomSummarySchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  name: z.string(),
  abbreviation: z.string(),
  uomType: z.string(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  _count: z.object({ productVariants: z.number() }),
});

export type UomSummary = z.infer<typeof UomSummarySchema>;

// ── Mutation Response Schemas ───────────────────────────────

export const UpdatedProductSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  sku: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  tags: z.array(z.string()),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  status: z.string(),
  categoryId: z.string().nullable(),
  brandId: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type UpdatedProduct = z.infer<typeof UpdatedProductSchema>;

export const UpdatedBrandSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  logoUrl: z.string().nullable(),
  isActive: z.boolean(),
  updatedAt: z.string(),
});

export type UpdatedBrand = z.infer<typeof UpdatedBrandSchema>;

export const UpdatedCategorySchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  parentId: z.string().nullable(),
  path: z.string(),
  sortOrder: z.number(),
  isActive: z.boolean(),
  updatedAt: z.string(),
});

export type UpdatedCategory = z.infer<typeof UpdatedCategorySchema>;

export const UpdatedVariantSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  productId: z.string(),
  sku: z.string(),
  name: z.string(),
  barcode: z.string().nullable(),
  isActive: z.boolean(),
  updatedAt: z.string(),
});

export type UpdatedVariant = z.infer<typeof UpdatedVariantSchema>;

export const DeletedProductSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  sku: z.string(),
  name: z.string(),
  deletedAt: z.string().nullable(),
});

export type DeletedProduct = z.infer<typeof DeletedProductSchema>;

export const DeletedVariantSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  productId: z.string(),
  sku: z.string(),
  name: z.string(),
  deletedAt: z.string().nullable(),
});

export type DeletedVariant = z.infer<typeof DeletedVariantSchema>;

export const DeletedBrandSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  name: z.string(),
  slug: z.string(),
  deletedAt: z.string().nullable(),
});

export type DeletedBrand = z.infer<typeof DeletedBrandSchema>;

export const DeletedCategorySchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  name: z.string(),
  slug: z.string(),
  deletedAt: z.string().nullable(),
});

export type DeletedCategory = z.infer<typeof DeletedCategorySchema>;
