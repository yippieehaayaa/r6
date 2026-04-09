import { type Brand, BrandSchema, PaginatedResponseSchema } from "@r6/schemas";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";
import { catalogKeys } from "../keys";

export interface ListBrandsParams {
	page?: number;
	limit?: number;
	search?: string;
	isActive?: boolean;
}

const ListBrandsResponseSchema = PaginatedResponseSchema(BrandSchema);

export async function listBrandsFn(
	params: ListBrandsParams = {},
): Promise<{ data: Brand[]; page: number; limit: number; total: number }> {
	const { data } = await inventoryApi.get<unknown>("/catalog/brands", {
		params,
	});
	return ListBrandsResponseSchema.parse(data);
}

export async function getBrandFn(id: string): Promise<Brand> {
	const { data } = await inventoryApi.get<unknown>(`/catalog/brands/${id}`);
	return BrandSchema.parse(data);
}

export function useListBrandsQuery(
	params: ListBrandsParams = {},
	options?: { staleTime?: number; gcTime?: number; enabled?: boolean },
) {
	return useQuery({
		queryKey: catalogKeys.brands.list(params),
		queryFn: () => listBrandsFn(params),
		staleTime: 1000 * 60 * 2,
		gcTime: 1000 * 60 * 10,
		placeholderData: keepPreviousData,
		...options,
	});
}

export function useGetBrandQuery(id: string) {
	return useQuery({
		queryKey: catalogKeys.brands.detail(id),
		queryFn: () => getBrandFn(id),
		enabled: !!id,
		staleTime: 1000 * 60 * 5,
	});
}
