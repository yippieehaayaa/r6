import { z } from "zod";
import { ListQuerySchema, UuidSchema } from "../base.schema";
import { ProductStatusSchema, UomTypeSchema } from "../enums.schema";

// ── Product Query ───────────────────────────────────────────

export const ListProductsQuerySchema = ListQuerySchema.extend({
  status: ProductStatusSchema.optional(),
  categoryId: UuidSchema.optional(),
  brandId: UuidSchema.optional(),
});

export type ListProductsQuery = z.infer<typeof ListProductsQuerySchema>;

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

export type ListVariantsQuery = z.infer<typeof ListVariantsQuerySchema>;

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

export type ListCategoriesQuery = z.infer<typeof ListCategoriesQuerySchema>;

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

export type ListBrandsQuery = z.infer<typeof ListBrandsQuerySchema>;

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

export type ListUomsQuery = z.infer<typeof ListUomsQuerySchema>;
