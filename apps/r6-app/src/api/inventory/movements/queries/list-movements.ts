import { type PaginatedResponse, PaginatedResponseSchema } from "@r6/schemas";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { inventoryApi } from "@/api/_app";

export interface ListMovementsParams {
	page?: number;
	limit?: number;
	search?: string;
	type?:
		| "RECEIPT"
		| "SALE"
		| "RETURN"
		| "ADJUSTMENT"
		| "TRANSFER_IN"
		| "TRANSFER_OUT"
		| "DAMAGE"
		| "RESERVATION"
		| "RESERVATION_RELEASE";
	variantId?: string;
	warehouseId?: string;
	fromCreatedAt?: string;
	toCreatedAt?: string;
	referenceId?: string;
	referenceType?: string;
}

const ListMovementsResponseSchema = PaginatedResponseSchema(z.unknown());

export async function listMovementsFn(
	tenantSlug: string,
	params: ListMovementsParams = {},
): Promise<PaginatedResponse<unknown>> {
	const { data } = await inventoryApi.get<unknown>(
		`/tenants/${tenantSlug}/movements`,
		{ params },
	);
	return ListMovementsResponseSchema.parse(data);
}

export function useListMovementsQuery(
	tenantSlug: string,
	params: ListMovementsParams = {},
	options?: { staleTime?: number; gcTime?: number },
) {
	return useQuery({
		queryKey: ["stock-movements", tenantSlug, params],
		queryFn: () => listMovementsFn(tenantSlug, params),
		enabled: !!tenantSlug,
		...options,
	});
}
