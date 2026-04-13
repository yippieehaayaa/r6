import {
	type ListStockCountsQuery,
	type PaginatedResponse,
	PaginatedResponseSchema,
} from "@r6/schemas";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { inventoryApi } from "@/api/_app";

export type ListStockCountsParams = ListStockCountsQuery;

const StockCountSchema = z.object({
	id: z.string(),
	tenantId: z.string(),
	warehouseId: z.string(),
	status: z.string(),
	countType: z.string(),
	notes: z.string().nullable(),
	performedBy: z.string(),
	supervisedBy: z.string().nullable(),
	completedAt: z.string().nullable(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export type StockCount = z.infer<typeof StockCountSchema>;

const ListStockCountsResponseSchema = PaginatedResponseSchema(StockCountSchema);

export async function listStockCountsFn(
	tenantSlug: string,
	params: ListStockCountsParams = {},
): Promise<PaginatedResponse<StockCount>> {
	const { data } = await inventoryApi.get<unknown>(
		`/tenants/${tenantSlug}/stock-counts`,
		{ params },
	);
	return ListStockCountsResponseSchema.parse(data);
}

export function useListStockCountsQuery(
	tenantSlug: string,
	params: ListStockCountsParams = {},
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
