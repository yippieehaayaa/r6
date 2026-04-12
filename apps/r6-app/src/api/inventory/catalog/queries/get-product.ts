import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { inventoryApi } from "@/api/_app";

const ProductDetailSchema = z.object({
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
	category: z
		.object({ id: z.string(), name: z.string(), slug: z.string() })
		.nullable(),
	brand: z
		.object({ id: z.string(), name: z.string(), slug: z.string() })
		.nullable(),
	variants: z.array(
		z.object({
			id: z.string(),
			sku: z.string(),
			name: z.string(),
			barcode: z.string().nullable(),
			options: z.record(z.string(), z.unknown()),
			trackingType: z.string(),
			isActive: z.boolean(),
			imageUrl: z.string().nullable(),
			baseUom: z
				.object({
					id: z.string(),
					name: z.string(),
					abbreviation: z.string(),
				})
				.nullable(),
			createdAt: z.string(),
			updatedAt: z.string(),
		}),
	),
});

export type ProductDetail = z.infer<typeof ProductDetailSchema>;

export async function getProductFn(
	tenantSlug: string,
	id: string,
): Promise<ProductDetail> {
	const { data } = await inventoryApi.get<unknown>(
		`/tenants/${tenantSlug}/catalog/products/${id}`,
	);
	return ProductDetailSchema.parse(data);
}

export function useGetProductQuery(
	tenantSlug: string,
	id: string,
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: ["product", tenantSlug, id],
		queryFn: () => getProductFn(tenantSlug, id),
		enabled: (options?.enabled ?? true) && !!tenantSlug && !!id,
		staleTime: 5 * 60 * 1000,
	});
}
