import {
	type ListStockReservationsQuery,
	PaginatedResponseSchema,
	type StockReservation,
	StockReservationSchema,
} from "@r6/schemas";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export type { StockReservation };

const ListReservationsResponseSchema = PaginatedResponseSchema(
	StockReservationSchema,
);

export async function listReservationsFn(
	tenantSlug: string,
	params: ListStockReservationsQuery = {},
) {
	const { data } = await inventoryApi.get<unknown>(
		`/tenants/${tenantSlug}/reservations`,
		{ params },
	);
	return ListReservationsResponseSchema.parse(data);
}

export function useListReservationsQuery(
	tenantSlug: string,
	params: ListStockReservationsQuery = {},
	options?: { staleTime?: number; gcTime?: number },
) {
	return useQuery({
		queryKey: ["stock-reservations", tenantSlug, params],
		queryFn: () => listReservationsFn(tenantSlug, params),
		enabled: !!tenantSlug,
		placeholderData: keepPreviousData,
		...options,
	});
}
