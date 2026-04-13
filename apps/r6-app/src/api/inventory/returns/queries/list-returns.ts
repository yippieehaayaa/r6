import { type PaginatedResponse, PaginatedResponseSchema } from "@r6/schemas";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { inventoryApi } from "@/api/_app";

export interface ListReturnsParams {
	page?: number;
	limit?: number;
	search?: string;
	status?:
		| "REQUESTED"
		| "APPROVED"
		| "RECEIVED"
		| "COMPLETED"
		| "REJECTED"
		| "CANCELLED";
	referenceId?: string;
}

const ListReturnsResponseSchema = PaginatedResponseSchema(z.unknown());

export async function listReturnsFn(
	tenantSlug: string,
	params: ListReturnsParams = {},
): Promise<PaginatedResponse<unknown>> {
	const { data } = await inventoryApi.get<unknown>(
		`/tenants/${tenantSlug}/returns`,
		{ params },
	);
	return ListReturnsResponseSchema.parse(data);
}

export function useListReturnsQuery(
	tenantSlug: string,
	params: ListReturnsParams = {},
	options?: { staleTime?: number; gcTime?: number },
) {
	return useQuery({
		queryKey: ["returns", tenantSlug, params],
		queryFn: () => listReturnsFn(tenantSlug, params),
		enabled: !!tenantSlug,
		...options,
	});
}
