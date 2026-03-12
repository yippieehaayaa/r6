import type { z } from "zod";
import {
	BrandSchema,
	CategorySchema,
	ProductSchema,
	ProductVariantSchema,
} from "./base-schemas";

export const UpdateCategorySchema = CategorySchema.partial();
export const UpdateBrandSchema = BrandSchema.partial();
export const UpdateProductSchema = ProductSchema.partial();
export const UpdateProductVariantSchema = ProductVariantSchema.partial();

export type UpdateCategory = z.infer<typeof UpdateCategorySchema>;
export type UpdateBrand = z.infer<typeof UpdateBrandSchema>;
export type UpdateProduct = z.infer<typeof UpdateProductSchema>;
export type UpdateProductVariant = z.infer<typeof UpdateProductVariantSchema>;
