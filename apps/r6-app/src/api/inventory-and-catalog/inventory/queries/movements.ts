import {
	PaginatedResponseSchema,
	type StockMovement,
	StockMovementSchema,
} from "@r6/schemas";
import { useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

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
		queryKey: ["movements", variantId, params],
		queryFn: () => listMovementsFn(variantId, params),
		enabled: !!variantId,
		...options,
	});
}
