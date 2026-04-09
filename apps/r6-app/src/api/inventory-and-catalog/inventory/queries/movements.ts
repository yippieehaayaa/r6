import {
	PaginatedResponseSchema,
	type StockMovement,
	StockMovementSchema,
} from "@r6/schemas";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";
import { inventoryKeys } from "../keys";

export interface ListMovementsParams {
	page?: number;
	limit?: number;
	type?: string;
	warehouseId?: string;
	from?: string;
	to?: string;
}

const ListMovementsResponseSchema =
	PaginatedResponseSchema(StockMovementSchema);

export async function listMovementsFn(
	variantId: string,
	params: ListMovementsParams = {},
): Promise<{
	data: StockMovement[];
	page: number;
	limit: number;
	total: number;
}> {
	const { data } = await inventoryApi.get<unknown>(
		`/inventory/movements/${variantId}`,
		{ params },
	);
	return ListMovementsResponseSchema.parse(data);
}

export function useListMovementsQuery(
	variantId: string,
	params: ListMovementsParams = {},
	options?: { staleTime?: number; gcTime?: number; enabled?: boolean },
) {
	return useQuery({
		queryKey: inventoryKeys.movements.list(variantId, params),
		queryFn: () => listMovementsFn(variantId, params),
		enabled: !!variantId,
		staleTime: 1000 * 60 * 2,
		gcTime: 1000 * 60 * 10,
		placeholderData: keepPreviousData,
		...options,
	});
}
