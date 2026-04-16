import { z } from "zod";
import { ListQuerySchema, UuidSchema } from "../base.schema";
import { DecimalStringSchema } from "../common";
import {
  DimensionUnitSchema,
  ProductStatusSchema,
  UomTypeSchema,
  WeightUnitSchema,
} from "../enums.schema";

// ── Product Query ───────────────────────────────────────────

export const ListProductsQuerySchema = ListQuerySchema.extend({
  status: ProductStatusSchema.optional(),
  categoryId: UuidSchema.optional(),
  brandId: UuidSchema.optional(),
});

export type ListProductsQuery = z.input<typeof ListProductsQuerySchema>;

export const GetProductParamsSchema = z.object({
  id: UuidSchema,
});

export type GetProductParams = z.infer<typeof GetProductParamsSchema>;

// ── Variant Query ───────────────────────────────────────────

export const ListVariantsQuerySchema = ListQuerySchema.extend({
  productId: UuidSchema.optional(),
  isActive: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
});

export type ListVariantsQuery = z.input<typeof ListVariantsQuerySchema>;

export const GetVariantParamsSchema = z.object({
  id: UuidSchema,
});

export type GetVariantParams = z.infer<typeof GetVariantParamsSchema>;

// ── Category Query ──────────────────────────────────────────

export const ListCategoriesQuerySchema = ListQuerySchema.extend({
  parentId: z
    .union([UuidSchema, z.literal("null")])
    .transform((v) => (v === "null" ? null : v))
    .optional(),
  isActive: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
});

export type ListCategoriesQuery = z.input<typeof ListCategoriesQuerySchema>;

export const GetCategoryParamsSchema = z.object({
  id: UuidSchema,
});

export type GetCategoryParams = z.infer<typeof GetCategoryParamsSchema>;

// ── Brand Query ─────────────────────────────────────────────

export const ListBrandsQuerySchema = ListQuerySchema.extend({
  isActive: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
});

export type ListBrandsQuery = z.input<typeof ListBrandsQuerySchema>;

export const GetBrandParamsSchema = z.object({
  id: UuidSchema,
});

export type GetBrandParams = z.infer<typeof GetBrandParamsSchema>;

// ── UOM Query ───────────────────────────────────────────────

export const ListUomsQuerySchema = ListQuerySchema.extend({
  uomType: UomTypeSchema.optional(),
  isActive: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
});

export type ListUomsQuery = z.input<typeof ListUomsQuerySchema>;

// ── Product Update ──────────────────────────────────────────

const VALID_PRODUCT_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["ACTIVE"],
  ACTIVE: ["DISCONTINUED"],
  DISCONTINUED: ["ACTIVE", "ARCHIVED"],
  ARCHIVED: [],
};

export const UpdateProductSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).nullish(),
  tags: z.array(z.string().max(50)).optional(),
  metadata: z.record(z.string(), z.unknown()).nullish(),
  status: ProductStatusSchema.optional(),
  categoryId: UuidSchema.nullish(),
  brandId: UuidSchema.nullish(),
});

export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;

export { VALID_PRODUCT_TRANSITIONS };

// ── Variant Update ──────────────────────────────────────────

export const UpdateVariantSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  barcode: z.string().max(50).nullish(),
  options: z.record(z.string(), z.unknown()).optional(),
  weight: DecimalStringSchema.nullish(),
  length: DecimalStringSchema.nullish(),
  width: DecimalStringSchema.nullish(),
  height: DecimalStringSchema.nullish(),
  dimensionUnit: DimensionUnitSchema.nullish(),
  weightUnit: WeightUnitSchema.nullish(),
  imageUrl: z.string().url().nullish(),
  metadata: z.record(z.string(), z.unknown()).nullish(),
  isActive: z.boolean().optional(),
});

export type UpdateVariantInput = z.infer<typeof UpdateVariantSchema>;

// ── Category Update ─────────────────────────────────────────

export const UpdateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullish(),
  parentId: UuidSchema.nullish(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;

// ── Brand Update ────────────────────────────────────────────

export const UpdateBrandSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullish(),
  logoUrl: z.string().url().nullish(),
  isActive: z.boolean().optional(),
});

export type UpdateBrandInput = z.infer<typeof UpdateBrandSchema>;
