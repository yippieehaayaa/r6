import {
	type ListStockCountsQuery,
	PaginatedResponseSchema,
	type StockCount,
	StockCountSchema,
} from "@r6/schemas";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export type { StockCount };

const ListStockCountsResponseSchema = PaginatedResponseSchema(StockCountSchema);

export async function listStockCountsFn(
	tenantId: string,
	params: ListStockCountsQuery = {},
) {
	const { data } = await inventoryApi.get<unknown>(
		`/tenants/${tenantId}/stock-counts`,
		{ params },
	);
	return ListStockCountsResponseSchema.parse(data);
}

export function useListStockCountsQuery(
	tenantId: string,
	params: ListStockCountsQuery = {},
	options?: { staleTime?: number; gcTime?: number },
) {
	return useQuery({
		queryKey: ["stock-counts", tenantId, params],
		queryFn: () => listStockCountsFn(tenantId, params),
		enabled: !!tenantId,
		placeholderData: keepPreviousData,
		staleTime: options?.staleTime ?? 30 * 1000,
		gcTime: options?.gcTime,
	});
}
