import { type ListBrandsQuery, PaginatedResponseSchema } from "@r6/schemas";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { inventoryApi } from "@/api/_app";

const BrandSummarySchema = z.object({
	id: z.string(),
	tenantId: z.string(),
	name: z.string(),
	slug: z.string(),
	description: z.string().nullable(),
	logoUrl: z.string().nullable(),
	isActive: z.boolean(),
	createdAt: z.string(),
	updatedAt: z.string(),
	_count: z.object({ products: z.number() }),
});

export type BrandSummary = z.infer<typeof BrandSummarySchema>;

const BrandListResponseSchema = PaginatedResponseSchema(BrandSummarySchema);

export async function listBrandsFn(
	tenantSlug: string,
	params: ListBrandsQuery = {},
) {
	const { data } = await inventoryApi.get<unknown>(
		`/tenants/${tenantSlug}/catalog/brands`,
		{ params },
	);
	return BrandListResponseSchema.parse(data);
}

export function useListBrandsQuery(
	tenantSlug: string,
	params: ListBrandsQuery = {},
	options?: { staleTime?: number },
) {
	return useQuery({
		queryKey: ["brands", tenantSlug, params],
		queryFn: () => listBrandsFn(tenantSlug, params),
		enabled: !!tenantSlug,
		placeholderData: keepPreviousData,
		staleTime: options?.staleTime ?? 5 * 60 * 1000,
	});
}
