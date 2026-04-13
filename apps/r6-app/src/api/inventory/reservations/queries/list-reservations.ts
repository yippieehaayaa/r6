import { type PaginatedResponse, PaginatedResponseSchema } from "@r6/schemas";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { inventoryApi } from "@/api/_app";

export interface ListReservationsParams {
	page?: number;
	limit?: number;
	search?: string;
	variantId?: string;
	warehouseId?: string;
	status?: "ACTIVE" | "FULFILLED" | "RELEASED" | "EXPIRED";
	referenceId?: string;
	referenceType?: string;
}

const ListReservationsResponseSchema = PaginatedResponseSchema(z.unknown());

export async function listReservationsFn(
	tenantSlug: string,
	params: ListReservationsParams = {},
): Promise<PaginatedResponse<unknown>> {
	const { data } = await inventoryApi.get<unknown>(
		`/tenants/${tenantSlug}/reservations`,
		{ params },
	);
	return ListReservationsResponseSchema.parse(data);
}

export function useListReservationsQuery(
	tenantSlug: string,
	params: ListReservationsParams = {},
	options?: { staleTime?: number; gcTime?: number },
) {
	return useQuery({
		queryKey: ["stock-reservations", tenantSlug, params],
		queryFn: () => listReservationsFn(tenantSlug, params),
		enabled: !!tenantSlug,
		...options,
	});
}
