import {
	type ListStockMovementsQuery,
	PaginatedResponseSchema,
	type StockMovement,
	StockMovementSchema,
} from "@r6/schemas";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export type { StockMovement };

const ListMovementsResponseSchema =
	PaginatedResponseSchema(StockMovementSchema);

export async function listMovementsFn(
	tenantSlug: string,
	params: ListStockMovementsQuery = {},
) {
	const { data } = await inventoryApi.get<unknown>(
		`/tenants/${tenantSlug}/movements`,
		{ params },
	);
	return ListMovementsResponseSchema.parse(data);
}

export function useListMovementsQuery(
	tenantSlug: string,
	params: ListStockMovementsQuery = {},
	options?: { staleTime?: number; gcTime?: number },
) {
	return useQuery({
		queryKey: ["stock-movements", tenantSlug, params],
		queryFn: () => listMovementsFn(tenantSlug, params),
		enabled: !!tenantSlug,
		placeholderData: keepPreviousData,
		...options,
	});
}
