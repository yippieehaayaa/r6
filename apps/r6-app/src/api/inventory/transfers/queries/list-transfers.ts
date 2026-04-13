import {
	type ListStockTransfersQuery,
	type PaginatedResponse,
	PaginatedResponseSchema,
} from "@r6/schemas";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { inventoryApi } from "@/api/_app";

export type ListTransfersParams = ListStockTransfersQuery;

const StockTransferSchema = z.object({
	id: z.string(),
	tenantId: z.string(),
	fromWarehouseId: z.string(),
	toWarehouseId: z.string(),
	status: z.string(),
	dispatchedBy: z.string(),
	dispatchedAt: z.string().nullable(),
	expectedAt: z.string().nullable(),
	notes: z.string().nullable(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export type StockTransfer = z.infer<typeof StockTransferSchema>;

const ListTransfersResponseSchema =
	PaginatedResponseSchema(StockTransferSchema);

export async function listTransfersFn(
	tenantSlug: string,
	params: ListTransfersParams = {},
): Promise<PaginatedResponse<StockTransfer>> {
	const { data } = await inventoryApi.get<unknown>(
		`/tenants/${tenantSlug}/transfers`,
		{ params },
	);
	return ListTransfersResponseSchema.parse(data);
}

export function useListTransfersQuery(
	tenantSlug: string,
	params: ListTransfersParams = {},
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
