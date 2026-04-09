import {
	PaginatedResponseSchema,
	type StockMovement,
	StockMovementSchema,
} from "@r6/schemas";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";
import { inventoryKeys } from "../keys";

export interface ListDamagesParams {
	page?: number;
	limit?: number;
	variantId?: string;
	warehouseId?: string;
	from?: string;
	to?: string;
}

const ListDamagesResponseSchema = PaginatedResponseSchema(StockMovementSchema);

export async function listDamagesFn(params: ListDamagesParams = {}): Promise<{
	data: StockMovement[];
	page: number;
	limit: number;
	total: number;
}> {
	const { data } = await inventoryApi.get<unknown>("/inventory/damages", {
		params,
	});
	return ListDamagesResponseSchema.parse(data);
}

export async function getDamageFn(id: string): Promise<StockMovement> {
	const { data } = await inventoryApi.get<unknown>(`/inventory/damages/${id}`);
	return StockMovementSchema.parse(data);
}

export function useListDamagesQuery(
	params: ListDamagesParams = {},
	options?: { staleTime?: number; gcTime?: number; enabled?: boolean },
) {
	return useQuery({
		queryKey: inventoryKeys.damages.list(params),
		queryFn: () => listDamagesFn(params),
		staleTime: 1000 * 60 * 2,
		gcTime: 1000 * 60 * 10,
		placeholderData: keepPreviousData,
		...options,
	});
}

export function useGetDamageQuery(
	id: string,
	options?: { staleTime?: number; gcTime?: number; enabled?: boolean },
) {
	return useQuery({
		queryKey: inventoryKeys.damages.detail(id),
		queryFn: () => getDamageFn(id),
		enabled: !!id,
		staleTime: 1000 * 60 * 5,
		...options,
	});
}
