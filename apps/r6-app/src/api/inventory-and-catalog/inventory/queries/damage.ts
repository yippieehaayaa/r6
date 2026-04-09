import {
	PaginatedResponseSchema,
	type StockMovement,
	StockMovementSchema,
} from "@r6/schemas";
import { useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

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
		queryKey: ["damages", params],
		queryFn: () => listDamagesFn(params),
		...options,
	});
}

export function useGetDamageQuery(
	id: string,
	options?: { staleTime?: number; gcTime?: number; enabled?: boolean },
) {
	return useQuery({
		queryKey: ["damages", id],
		queryFn: () => getDamageFn(id),
		enabled: !!id,
		...options,
	});
}
