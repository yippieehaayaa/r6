import {
	type Category,
	CategorySchema,
	type ListCategoriesQuery,
	PaginatedResponseSchema,
} from "@r6/schemas";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export type { Category };

const CategoryListResponseSchema = PaginatedResponseSchema(CategorySchema);

export async function listCategoriesFn(
	tenantSlug: string,
	/** Pass parentId as the string "null" to fetch only top-level categories */
	params: ListCategoriesQuery = {},
) {
	const { data } = await inventoryApi.get<unknown>(
		`/tenants/${tenantSlug}/catalog/categories`,
		{ params },
	);
	return CategoryListResponseSchema.parse(data);
}

export function useListCategoriesQuery(
	tenantSlug: string,
	params: ListCategoriesQuery = {},
	options?: { staleTime?: number },
) {
	return useQuery({
		queryKey: ["categories", tenantSlug, params],
		queryFn: () => listCategoriesFn(tenantSlug, params),
		enabled: !!tenantSlug,
		placeholderData: keepPreviousData,
		staleTime: options?.staleTime ?? 5 * 60 * 1000,
	});
}
