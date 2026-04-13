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
	tenantSlug: string,
	params: ListReturnRequestsQuery = {},
) {
	const { data } = await inventoryApi.get<unknown>(
		`/tenants/${tenantSlug}/returns`,
		{ params },
	);
	return ListReturnsResponseSchema.parse(data);
}

export function useListReturnsQuery(
	tenantSlug: string,
	params: ListReturnRequestsQuery = {},
	options?: { staleTime?: number; gcTime?: number },
) {
	return useQuery({
		queryKey: ["returns", tenantSlug, params],
		queryFn: () => listReturnsFn(tenantSlug, params),
		enabled: !!tenantSlug,
		placeholderData: keepPreviousData,
		...options,
	});
}
