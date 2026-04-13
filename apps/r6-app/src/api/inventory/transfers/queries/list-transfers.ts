import {
	type ListStockTransfersQuery,
	PaginatedResponseSchema,
	type StockTransfer,
	StockTransferSchema,
} from "@r6/schemas";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export type { StockTransfer };

const ListTransfersResponseSchema =
	PaginatedResponseSchema(StockTransferSchema);

export async function listTransfersFn(
	tenantSlug: string,
	params: ListStockTransfersQuery = {},
) {
	const { data } = await inventoryApi.get<unknown>(
		`/tenants/${tenantSlug}/transfers`,
		{ params },
	);
	return ListTransfersResponseSchema.parse(data);
}

export function useListTransfersQuery(
	tenantSlug: string,
	params: ListStockTransfersQuery = {},
	options?: { staleTime?: number; gcTime?: number },
) {
	return useQuery({
		queryKey: ["transfers", tenantSlug, params],
		queryFn: () => listTransfersFn(tenantSlug, params),
		enabled: !!tenantSlug,
		placeholderData: keepPreviousData,
		staleTime: options?.staleTime ?? 30 * 1000,
		gcTime: options?.gcTime,
	});
}
