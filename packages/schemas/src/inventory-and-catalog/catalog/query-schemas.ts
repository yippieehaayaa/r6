import { z } from "zod";

export const CategoryQuerySchema = z.union([
	z.strictObject({ id: z.string() }),
	z.strictObject({ slug: z.string() }),
]);

export const BrandQuerySchema = z.union([
	z.strictObject({ id: z.string() }),
	z.strictObject({ name: z.string() }),
	z.strictObject({ slug: z.string() }),
]);

export const ProductQuerySchema = z.union([
	z.strictObject({ id: z.string() }),
	z.strictObject({ sku: z.string() }),
	z.strictObject({ slug: z.string() }),
]);

export const ProductVariantQuerySchema = z.union([
	z.strictObject({ id: z.string() }),
	z.strictObject({ sku: z.string() }),
]);

export type CategoryQuery = z.infer<typeof CategoryQuerySchema>;
export type BrandQuery = z.infer<typeof BrandQuerySchema>;
export type ProductQuery = z.infer<typeof ProductQuerySchema>;
export type ProductVariantQuery = z.infer<typeof ProductVariantQuerySchema>;
