import {
	type ListWarehousesQuery,
	PaginatedResponseSchema,
	type Warehouse,
	WarehouseSchema,
} from "@r6/schemas";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export type { Warehouse };

const ListWarehousesResponseSchema = PaginatedResponseSchema(WarehouseSchema);

export async function listWarehousesFn(
	tenantSlug: string,
	params: ListWarehousesQuery = {},
) {
	const { data } = await inventoryApi.get<unknown>(
		`/tenants/${tenantSlug}/warehouses`,
		{ params },
	);
	return ListWarehousesResponseSchema.parse(data);
}

export function useListWarehousesQuery(
	tenantSlug: string,
	params: ListWarehousesQuery = {},
	options?: { staleTime?: number; gcTime?: number },
) {
	return useQuery({
		queryKey: ["warehouses", tenantSlug, params],
		queryFn: () => listWarehousesFn(tenantSlug, params),
		enabled: !!tenantSlug,
		placeholderData: keepPreviousData,
		staleTime: options?.staleTime ?? 60 * 1000,
		gcTime: options?.gcTime,
	});
}
