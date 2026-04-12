import { type ListUomsQuery, PaginatedResponseSchema } from "@r6/schemas";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { inventoryApi } from "@/api/_app";

const UomSummarySchema = z.object({
	id: z.string(),
	tenantId: z.string(),
	name: z.string(),
	abbreviation: z.string(),
	uomType: z.string(),
	isActive: z.boolean(),
	createdAt: z.string(),
	updatedAt: z.string(),
	_count: z.object({ productVariants: z.number() }),
});

export type UomSummary = z.infer<typeof UomSummarySchema>;

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
