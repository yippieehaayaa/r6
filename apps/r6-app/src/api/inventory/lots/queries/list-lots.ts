import { type PaginatedResponse, PaginatedResponseSchema } from "@r6/schemas";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { inventoryApi } from "@/api/_app";

export interface ListLotsParams {
	page?: number;
	limit?: number;
	search?: string;
	variantId?: string;
	warehouseId?: string;
	isQuarantined?: boolean;
}

const ListLotsResponseSchema = PaginatedResponseSchema(z.unknown());

export async function listLotsFn(
	tenantSlug: string,
	params: ListLotsParams = {},
): Promise<PaginatedResponse<unknown>> {
	const { data } = await inventoryApi.get<unknown>(
		`/tenants/${tenantSlug}/lots`,
		{ params },
	);
	return ListLotsResponseSchema.parse(data);
}

export function useListLotsQuery(
	tenantSlug: string,
	params: ListLotsParams = {},
	options?: { staleTime?: number; gcTime?: number },
) {
	return useQuery({
		queryKey: ["lots", tenantSlug, params],
		queryFn: () => listLotsFn(tenantSlug, params),
		enabled: !!tenantSlug,
		...options,
	});
}
