import {
	type ListReturnRequestsQuery,
	PaginatedResponseSchema,
	type ReturnRequestSummary,
	ReturnRequestSummarySchema,
} from "@r6/schemas";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export type { ReturnRequestSummary };

const ListReturnsResponseSchema = PaginatedResponseSchema(
	ReturnRequestSummarySchema,
);

export async function listReturnsFn(
	tenantId: string,
	params: ListReturnRequestsQuery = {},
) {
	const { data } = await inventoryApi.get<unknown>(
		`/tenants/${tenantId}/returns`,
		{ params },
	);
	return ListReturnsResponseSchema.parse(data);
}

export function useListReturnsQuery(
	tenantId: string,
	params: ListReturnRequestsQuery = {},
	options?: { staleTime?: number; gcTime?: number },
) {
	return useQuery({
		queryKey: ["returns", tenantId, params],
		queryFn: () => listReturnsFn(tenantId, params),
		enabled: !!tenantId,
		placeholderData: keepPreviousData,
		...options,
	});
}
