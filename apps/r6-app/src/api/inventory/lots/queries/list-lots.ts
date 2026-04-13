import {
	type InventoryLot,
	InventoryLotSchema,
	type ListInventoryLotsQuery,
	PaginatedResponseSchema,
} from "@r6/schemas";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export type { InventoryLot };

const ListLotsResponseSchema = PaginatedResponseSchema(InventoryLotSchema);

export async function listLotsFn(
	tenantSlug: string,
	params: ListInventoryLotsQuery = {},
) {
	const { data } = await inventoryApi.get<unknown>(
		`/tenants/${tenantSlug}/lots`,
		{ params },
	);
	return ListLotsResponseSchema.parse(data);
}

export function useListLotsQuery(
	tenantSlug: string,
	params: ListInventoryLotsQuery = {},
	options?: { staleTime?: number; gcTime?: number },
) {
	return useQuery({
		queryKey: ["lots", tenantSlug, params],
		queryFn: () => listLotsFn(tenantSlug, params),
		enabled: !!tenantSlug,
		placeholderData: keepPreviousData,
		...options,
	});
}
