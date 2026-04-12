import { type ListVariantsQuery, PaginatedResponseSchema } from "@r6/schemas";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { inventoryApi } from "@/api/_app";

const VariantSummarySchema = z.object({
	id: z.string(),
	tenantId: z.string(),
	productId: z.string(),
	sku: z.string(),
	name: z.string(),
	barcode: z.string().nullable(),
	options: z.record(z.string(), z.unknown()),
	trackingType: z.string(),
	weight: z.string().nullable(),
	length: z.string().nullable(),
	width: z.string().nullable(),
	height: z.string().nullable(),
	dimensionUnit: z.string().nullable(),
	weightUnit: z.string().nullable(),
	imageUrl: z.string().nullable(),
	metadata: z.record(z.string(), z.unknown()).nullable(),
	isActive: z.boolean(),
	baseUomId: z.string().nullable(),
	createdAt: z.string(),
	updatedAt: z.string(),
	product: z
		.object({
			id: z.string(),
			sku: z.string(),
			name: z.string(),
			slug: z.string(),
			status: z.string(),
		})
		.nullable(),
	baseUom: z
		.object({ id: z.string(), name: z.string(), abbreviation: z.string() })
		.nullable(),
});

export type VariantSummary = z.infer<typeof VariantSummarySchema>;

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
