import {
	type Category,
	CategorySchema,
	PaginatedResponseSchema,
} from "@r6/schemas";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";
import { catalogKeys } from "../keys";

export interface ListCategoriesParams {
	page?: number;
	limit?: number;
	search?: string;
	parentId?: string;
	isActive?: boolean;
}

const ListCategoriesResponseSchema = PaginatedResponseSchema(CategorySchema);

export async function listCategoriesFn(
	params: ListCategoriesParams = {},
): Promise<{ data: Category[]; page: number; limit: number; total: number }> {
	const { data } = await inventoryApi.get<unknown>("/catalog/categories", {
		params,
	});
	return ListCategoriesResponseSchema.parse(data);
}

export async function getCategoryFn(id: string): Promise<Category> {
	const { data } = await inventoryApi.get<unknown>(`/catalog/categories/${id}`);
	return CategorySchema.parse(data);
}

export async function getCategoryTreeFn(id: string): Promise<Category[]> {
	const { data } = await inventoryApi.get<unknown>(
		`/catalog/categories/${id}/tree`,
	);
	return CategorySchema.array().parse(data);
}

export function useListCategoriesQuery(
	params: ListCategoriesParams = {},
	options?: { staleTime?: number; gcTime?: number; enabled?: boolean },
) {
	return useQuery({
		queryKey: catalogKeys.categories.list(params),
		queryFn: () => listCategoriesFn(params),
		staleTime: 1000 * 60 * 2,
		gcTime: 1000 * 60 * 10,
		placeholderData: keepPreviousData,
		...options,
	});
}

export function useGetCategoryQuery(id: string) {
	return useQuery({
		queryKey: catalogKeys.categories.detail(id),
		queryFn: () => getCategoryFn(id),
		enabled: !!id,
		staleTime: 1000 * 60 * 5,
	});
}

export function useGetCategoryTreeQuery(id: string) {
	return useQuery({
		queryKey: catalogKeys.categories.tree(id),
		queryFn: () => getCategoryTreeFn(id),
		enabled: !!id,
		staleTime: 1000 * 60 * 5,
	});
}
