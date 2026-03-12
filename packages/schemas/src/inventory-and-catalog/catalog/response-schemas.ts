import type { z } from "zod";
import {
  BrandSchema,
  CategorySchema,
  ProductSchema,
  ProductVariantSchema,
} from "./base-schemas";

export const CategoryResponseSchema = CategorySchema;
export const BrandResponseSchema = BrandSchema;
export const ProductResponseSchema = ProductSchema;
export const ProductVariantResponseSchema = ProductVariantSchema;

export type CategoryResponse = z.infer<typeof CategoryResponseSchema>;
export type BrandResponse = z.infer<typeof BrandResponseSchema>;
export type ProductResponse = z.infer<typeof ProductResponseSchema>;
export type ProductVariantResponse = z.infer<
  typeof ProductVariantResponseSchema
>;
