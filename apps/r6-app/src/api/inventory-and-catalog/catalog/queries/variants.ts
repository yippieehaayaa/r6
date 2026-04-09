import {
	PaginatedResponseSchema,
	type ProductVariant,
	ProductVariantSchema,
} from "@r6/schemas";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";
import { catalogKeys } from "../keys";

export interface ListVariantsParams {
	page?: number;
	limit?: number;
	search?: string;
	isActive?: boolean;
}

const ListVariantsResponseSchema =
	PaginatedResponseSchema(ProductVariantSchema);

export async function listVariantsByProductFn(
	productId: string,
	params: ListVariantsParams = {},
): Promise<{
	data: ProductVariant[];
	page: number;
	limit: number;
	total: number;
}> {
	const { data } = await inventoryApi.get<unknown>(
		`/catalog/products/${productId}/variants`,
		{ params },
	);
	return ListVariantsResponseSchema.parse(data);
}

export async function getVariantFn(id: string): Promise<ProductVariant> {
	const { data } = await inventoryApi.get<unknown>(`/catalog/variants/${id}`);
	return ProductVariantSchema.parse(data);
}

export function useListVariantsByProductQuery(
	productId: string,
	params: ListVariantsParams = {},
	options?: { staleTime?: number; gcTime?: number; enabled?: boolean },
) {
	return useQuery({
		queryKey: catalogKeys.variants.list(productId, params),
		queryFn: () => listVariantsByProductFn(productId, params),
		enabled: !!productId,
		staleTime: 1000 * 60 * 2,
		gcTime: 1000 * 60 * 10,
		placeholderData: keepPreviousData,
		...options,
	});
}

export function useGetVariantQuery(id: string) {
	return useQuery({
		queryKey: catalogKeys.variants.detail(id),
		queryFn: () => getVariantFn(id),
		enabled: !!id,
		staleTime: 1000 * 60 * 5,
	});
}
