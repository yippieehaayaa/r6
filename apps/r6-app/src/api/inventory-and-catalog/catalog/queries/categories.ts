import {
	type Category,
	CategorySchema,
	PaginatedResponseSchema,
} from "@r6/schemas";
import { useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

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
		queryKey: ["categories", params],
		queryFn: () => listCategoriesFn(params),
		...options,
	});
}

export function useGetCategoryQuery(id: string) {
	return useQuery({
		queryKey: ["categories", id],
		queryFn: () => getCategoryFn(id),
		enabled: !!id,
	});
}

export function useGetCategoryTreeQuery(id: string) {
	return useQuery({
		queryKey: ["categories", id, "tree"],
		queryFn: () => getCategoryTreeFn(id),
		enabled: !!id,
	});
}
