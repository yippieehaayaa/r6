import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { inventoryApi } from "@/api/_app";

const VariantDetailSchema = z.object({
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
			categoryId: z.string().nullable(),
			brandId: z.string().nullable(),
			category: z.object({ id: z.string(), name: z.string() }).nullable(),
			brand: z.object({ id: z.string(), name: z.string() }).nullable(),
		})
		.nullable(),
	baseUom: z
		.object({ id: z.string(), name: z.string(), abbreviation: z.string() })
		.nullable(),
});

export type VariantDetail = z.infer<typeof VariantDetailSchema>;

export async function getVariantFn(
	tenantSlug: string,
	id: string,
): Promise<VariantDetail> {
	const { data } = await inventoryApi.get<unknown>(
		`/tenants/${tenantSlug}/catalog/variants/${id}`,
	);
	return VariantDetailSchema.parse(data);
}

export function useGetVariantQuery(
	tenantSlug: string,
	id: string,
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: ["variant", tenantSlug, id],
		queryFn: () => getVariantFn(tenantSlug, id),
		enabled: (options?.enabled ?? true) && !!tenantSlug && !!id,
		staleTime: 5 * 60 * 1000,
	});
}
