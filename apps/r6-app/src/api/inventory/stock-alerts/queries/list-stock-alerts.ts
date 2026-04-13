import {
	type ListStockAlertsQuery,
	PaginatedResponseSchema,
	type StockAlert,
	StockAlertSchema,
} from "@r6/schemas";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export type { StockAlert };

const ListStockAlertsResponseSchema = PaginatedResponseSchema(StockAlertSchema);

export async function listStockAlertsFn(
	tenantSlug: string,
	params: ListStockAlertsQuery = {},
) {
	const { data } = await inventoryApi.get<unknown>(
		`/tenants/${tenantSlug}/stock-alerts`,
		{ params },
	);
	return ListStockAlertsResponseSchema.parse(data);
}

export function useListStockAlertsQuery(
	tenantSlug: string,
	params: ListStockAlertsQuery = {},
	options?: { staleTime?: number; gcTime?: number },
) {
	return useQuery({
		queryKey: ["stock-alerts", tenantSlug, params],
		queryFn: () => listStockAlertsFn(tenantSlug, params),
		enabled: !!tenantSlug,
		placeholderData: keepPreviousData,
		staleTime: options?.staleTime ?? 30 * 1000,
		gcTime: options?.gcTime,
	});
}
