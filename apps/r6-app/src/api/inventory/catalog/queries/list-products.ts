import {
	type ListProductsQuery,
	PaginatedResponseSchema,
	type ProductSummary,
	ProductSummarySchema,
} from "@r6/schemas";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export type { ProductSummary };

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
