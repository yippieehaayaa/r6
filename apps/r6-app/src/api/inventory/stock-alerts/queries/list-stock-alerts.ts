import {
	type ListStockAlertsQuery,
	type PaginatedResponse,
	PaginatedResponseSchema,
} from "@r6/schemas";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { inventoryApi } from "@/api/_app";

export type ListStockAlertsParams = ListStockAlertsQuery;

const StockAlertSchema = z.object({
	id: z.string(),
	tenantId: z.string(),
	alertType: z.string(),
	status: z.string(),
	variantId: z.string().nullable(),
	warehouseId: z.string().nullable(),
	threshold: z.number().nullable(),
	currentValue: z.number().nullable(),
	notes: z.string().nullable(),
	acknowledgedBy: z.string().nullable(),
	acknowledgedAt: z.string().nullable(),
	resolvedBy: z.string().nullable(),
	resolvedAt: z.string().nullable(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export type StockAlert = z.infer<typeof StockAlertSchema>;

const ListStockAlertsResponseSchema = PaginatedResponseSchema(StockAlertSchema);

export async function listStockAlertsFn(
	tenantSlug: string,
	params: ListStockAlertsParams = {},
): Promise<PaginatedResponse<StockAlert>> {
	const { data } = await inventoryApi.get<unknown>(
		`/tenants/${tenantSlug}/stock-alerts`,
		{ params },
	);
	return ListStockAlertsResponseSchema.parse(data);
}

export function useListStockAlertsQuery(
	tenantSlug: string,
	params: ListStockAlertsParams = {},
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
