import {
	type ListUomsQuery,
	PaginatedResponseSchema,
	type UomSummary,
	UomSummarySchema,
} from "@r6/schemas";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export type { UomSummary };

const UomListResponseSchema = PaginatedResponseSchema(UomSummarySchema);

export async function listUomsFn(
	tenantSlug: string,
	params: ListUomsQuery = {},
) {
	const { data } = await inventoryApi.get<unknown>(
		`/tenants/${tenantSlug}/catalog/uoms`,
		{ params },
	);
	return UomListResponseSchema.parse(data);
}

export function useListUomsQuery(
	tenantSlug: string,
	params: ListUomsQuery = {},
	options?: { staleTime?: number },
) {
	return useQuery({
		queryKey: ["uoms", tenantSlug, params],
		queryFn: () => listUomsFn(tenantSlug, params),
		enabled: !!tenantSlug,
		placeholderData: keepPreviousData,
		staleTime: options?.staleTime ?? 5 * 60 * 1000,
	});
}
