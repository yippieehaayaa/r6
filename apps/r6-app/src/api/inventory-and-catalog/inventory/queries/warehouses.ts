import {
	PaginatedResponseSchema,
	type Warehouse,
	WarehouseSchema,
} from "@r6/schemas";
import { useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export interface ListWarehousesParams {
	page?: number;
	limit?: number;
	search?: string;
	isActive?: boolean;
}

const ListWarehousesResponseSchema = PaginatedResponseSchema(WarehouseSchema);

export async function listWarehousesFn(
	params: ListWarehousesParams = {},
): Promise<{ data: Warehouse[]; page: number; limit: number; total: number }> {
	const { data } = await inventoryApi.get<unknown>("/inventory/warehouses", {
		params,
	});
	return ListWarehousesResponseSchema.parse(data);
}

export async function getWarehouseFn(id: string): Promise<Warehouse> {
	const { data } = await inventoryApi.get<unknown>(
		`/inventory/warehouses/${id}`,
	);
	return WarehouseSchema.parse(data);
}

export function useListWarehousesQuery(
	params: ListWarehousesParams = {},
	options?: { staleTime?: number; gcTime?: number; enabled?: boolean },
) {
	return useQuery({
		queryKey: ["warehouses", params],
		queryFn: () => listWarehousesFn(params),
		...options,
	});
}

export function useGetWarehouseQuery(id: string) {
	return useQuery({
		queryKey: ["warehouses", id],
		queryFn: () => getWarehouseFn(id),
		enabled: !!id,
	});
}
