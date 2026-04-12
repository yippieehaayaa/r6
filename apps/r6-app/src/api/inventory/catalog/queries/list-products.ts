import { type ListProductsQuery, PaginatedResponseSchema } from "@r6/schemas";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { inventoryApi } from "@/api/_app";

const ProductSummarySchema = z.object({
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
	_count: z.object({ variants: z.number() }),
});

export type ProductSummary = z.infer<typeof ProductSummarySchema>;

const ProductListResponseSchema = PaginatedResponseSchema(ProductSummarySchema);

export async function listProductsFn(
	tenantSlug: string,
	params: ListProductsQuery = {},
) {
	const { data } = await inventoryApi.get<unknown>(
		`/tenants/${tenantSlug}/catalog/products`,
		{ params },
	);
	return ProductListResponseSchema.parse(data);
}

export function useListProductsQuery(
	tenantSlug: string,
	params: ListProductsQuery = {},
	options?: { staleTime?: number },
) {
	return useQuery({
		queryKey: ["products", tenantSlug, params],
		queryFn: () => listProductsFn(tenantSlug, params),
		enabled: !!tenantSlug,
		placeholderData: keepPreviousData,
		staleTime: options?.staleTime ?? 5 * 60 * 1000,
	});
}
