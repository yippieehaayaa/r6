import {
	type InventoryItem,
	InventoryItemSchema,
	type ListInventoryItemsQuery,
	PaginatedResponseSchema,
} from "@r6/schemas";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export type { InventoryItem };

const InventoryItemListResponseSchema =
	PaginatedResponseSchema(InventoryItemSchema);

export async function listInventoryItemsFn(
	tenantSlug: string,
	params: ListInventoryItemsQuery = {},
) {
	const { data } = await inventoryApi.get<unknown>(
		`/tenants/${tenantSlug}/inventory-items`,
		{ params },
	);
	return InventoryItemListResponseSchema.parse(data);
}

export function useListInventoryItemsQuery(
	tenantSlug: string,
	params: ListInventoryItemsQuery = {},
	options?: { staleTime?: number },
) {
	return useQuery({
		queryKey: ["inventory-items", tenantSlug, params],
		queryFn: () => listInventoryItemsFn(tenantSlug, params),
		enabled: !!tenantSlug,
		placeholderData: keepPreviousData,
		staleTime: options?.staleTime ?? 30 * 1000,
	});
}
