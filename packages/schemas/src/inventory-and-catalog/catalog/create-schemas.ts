import { z } from "zod";
import { ImageEmbedSchema } from "./base-schemas";
import { ProductStatusSchema } from "./enums";

export const CreateCategorySchema = z.strictObject({
	name: z.string(),
	slug: z.string(),
	description: z.string().optional(),
	parentId: z.string().optional(),
	isActive: z.boolean(),
	sortOrder: z.number().int(),
});

export const CreateBrandSchema = z.strictObject({
	name: z.string(),
	slug: z.string(),
	description: z.string().optional(),
	logoUrl: z.string().optional(),
	isActive: z.boolean(),
});

export const CreateProductSchema = z.strictObject({
	sku: z.string(),
	name: z.string(),
	slug: z.string(),
	description: z.string().optional(),
	tags: z.string().array(),
	status: ProductStatusSchema,
	isActive: z.boolean(),
	metadata: z.unknown().optional(),
	categoryId: z.string(),
	brandId: z.string().optional(),
});

export const CreateProductVariantSchema = z.strictObject({
	sku: z.string(),
	name: z.string(),
	options: z.unknown(),
	price: z.number(),
	compareAtPrice: z.number().optional(),
	weight: z.number().optional(),
	images: ImageEmbedSchema.array(),
	isActive: z.boolean(),
	productId: z.string(),
});

export type CreateCategory = z.infer<typeof CreateCategorySchema>;
export type CreateBrand = z.infer<typeof CreateBrandSchema>;
export type CreateProduct = z.infer<typeof CreateProductSchema>;
export type CreateProductVariant = z.infer<typeof CreateProductVariantSchema>;
