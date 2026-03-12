import type { z } from "zod";
import {
  CreateBrandSchema,
  CreateCategorySchema,
  CreateProductSchema,
  CreateProductVariantSchema,
} from "./create-schemas";

export const UpdateCategorySchema = CreateCategorySchema.partial();
export const UpdateBrandSchema = CreateBrandSchema.partial();
export const UpdateProductSchema = CreateProductSchema.partial();
export const UpdateProductVariantSchema = CreateProductVariantSchema.partial();
export type UpdateBrand = z.infer<typeof UpdateBrandSchema>;
export type UpdateProduct = z.infer<typeof UpdateProductSchema>;
export type UpdateProductVariant = z.infer<typeof UpdateProductVariantSchema>;
