import {
	type ListVariantsQuery,
	PaginatedResponseSchema,
	type VariantSummary,
	VariantSummarySchema,
} from "@r6/schemas";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export type { VariantSummary };

const VariantListResponseSchema = PaginatedResponseSchema(VariantSummarySchema);

export async function listVariantsFn(
	tenantSlug: string,
	params: ListVariantsQuery = {},
) {
	const { data } = await inventoryApi.get<unknown>(
		`/tenants/${tenantSlug}/catalog/variants`,
		{ params },
	);
	return VariantListResponseSchema.parse(data);
}

export function useListVariantsQuery(
	tenantSlug: string,
	params: ListVariantsQuery = {},
	options?: { staleTime?: number },
) {
	return useQuery({
		queryKey: ["variants", tenantSlug, params],
		queryFn: () => listVariantsFn(tenantSlug, params),
		enabled: !!tenantSlug,
		placeholderData: keepPreviousData,
		staleTime: options?.staleTime ?? 5 * 60 * 1000,
	});
}
