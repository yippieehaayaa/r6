import {
	PaginatedResponseSchema,
	type Product,
	ProductSchema,
} from "@r6/schemas";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";
import { catalogKeys } from "../keys";

export interface ListProductsParams {
	page?: number;
	limit?: number;
	search?: string;
	categoryId?: string;
	brandId?: string;
	status?: string;
	tags?: string;
}

const ListProductsResponseSchema = PaginatedResponseSchema(ProductSchema);

export async function listProductsFn(
	params: ListProductsParams = {},
): Promise<{ data: Product[]; page: number; limit: number; total: number }> {
	const { data } = await inventoryApi.get<unknown>("/catalog/products", {
		params,
	});
	return ListProductsResponseSchema.parse(data);
}

export async function getProductFn(id: string): Promise<Product> {
	const { data } = await inventoryApi.get<unknown>(`/catalog/products/${id}`);
	return ProductSchema.parse(data);
}

export async function getProductBySlugFn(slug: string): Promise<Product> {
	const { data } = await inventoryApi.get<unknown>(
		`/catalog/products/slug/${slug}`,
	);
	return ProductSchema.parse(data);
}

export function useListProductsQuery(
	params: ListProductsParams = {},
	options?: { staleTime?: number; gcTime?: number; enabled?: boolean },
) {
	return useQuery({
		queryKey: catalogKeys.products.list(params),
		queryFn: () => listProductsFn(params),
		staleTime: 1000 * 60 * 2,
		gcTime: 1000 * 60 * 10,
		placeholderData: keepPreviousData,
		...options,
	});
}

export function useGetProductQuery(id: string) {
	return useQuery({
		queryKey: catalogKeys.products.detail(id),
		queryFn: () => getProductFn(id),
		enabled: !!id,
		staleTime: 1000 * 60 * 5,
	});
}

export function useGetProductBySlugQuery(slug: string) {
	return useQuery({
		queryKey: catalogKeys.products.bySlug(slug),
		queryFn: () => getProductBySlugFn(slug),
		enabled: !!slug,
		staleTime: 1000 * 60 * 5,
	});
}
