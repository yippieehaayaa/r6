import {
	type Brand,
	BrandSchema,
	type ListBrandsQuery,
	PaginatedResponseSchema,
} from "@r6/schemas";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export type { Brand };

const BrandListResponseSchema = PaginatedResponseSchema(BrandSchema);

export async function listBrandsFn(
	tenantSlug: string,
	params: ListBrandsQuery = {},
) {
	const { data } = await inventoryApi.get<unknown>(
		`/tenants/${tenantSlug}/catalog/brands`,
		{ params },
	);
	return BrandListResponseSchema.parse(data);
}

export function useListBrandsQuery(
	tenantSlug: string,
	params: ListBrandsQuery = {},
	options?: { staleTime?: number },
) {
	return useQuery({
		queryKey: ["brands", tenantSlug, params],
		queryFn: () => listBrandsFn(tenantSlug, params),
		enabled: !!tenantSlug,
		placeholderData: keepPreviousData,
		staleTime: options?.staleTime ?? 5 * 60 * 1000,
	});
}
