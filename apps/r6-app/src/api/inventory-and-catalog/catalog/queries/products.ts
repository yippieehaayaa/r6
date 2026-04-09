import {
	PaginatedResponseSchema,
	type Product,
	ProductSchema,
} from "@r6/schemas";
import { useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

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
		queryKey: ["products", params],
		queryFn: () => listProductsFn(params),
		...options,
	});
}

export function useGetProductQuery(id: string) {
	return useQuery({
		queryKey: ["products", id],
		queryFn: () => getProductFn(id),
		enabled: !!id,
	});
}

export function useGetProductBySlugQuery(slug: string) {
	return useQuery({
		queryKey: ["products", "slug", slug],
		queryFn: () => getProductBySlugFn(slug),
		enabled: !!slug,
	});
}
