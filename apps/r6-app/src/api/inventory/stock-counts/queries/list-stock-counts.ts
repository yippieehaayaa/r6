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
	tenantSlug: string,
	params: ListStockCountsQuery = {},
) {
	const { data } = await inventoryApi.get<unknown>(
		`/tenants/${tenantSlug}/stock-counts`,
		{ params },
	);
	return ListStockCountsResponseSchema.parse(data);
}

export function useListStockCountsQuery(
	tenantSlug: string,
	params: ListStockCountsQuery = {},
	options?: { staleTime?: number; gcTime?: number },
) {
	return useQuery({
		queryKey: ["stock-counts", tenantSlug, params],
		queryFn: () => listStockCountsFn(tenantSlug, params),
		enabled: !!tenantSlug,
		placeholderData: keepPreviousData,
		staleTime: options?.staleTime ?? 30 * 1000,
		gcTime: options?.gcTime,
	});
}
