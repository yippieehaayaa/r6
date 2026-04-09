import {
	PaginatedResponseSchema,
	type ProductVariant,
	ProductVariantSchema,
} from "@r6/schemas";
import { useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

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
		queryKey: ["variants", productId, params],
		queryFn: () => listVariantsByProductFn(productId, params),
		enabled: !!productId,
		...options,
	});
}

export function useGetVariantQuery(id: string) {
	return useQuery({
		queryKey: ["variants", id],
		queryFn: () => getVariantFn(id),
		enabled: !!id,
	});
}
