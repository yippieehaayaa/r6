import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { inventoryApi } from "@/api/_app";

const BrandDetailSchema = z.object({
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

export type BrandDetail = z.infer<typeof BrandDetailSchema>;

export async function getBrandFn(
	tenantSlug: string,
	id: string,
): Promise<BrandDetail> {
	const { data } = await inventoryApi.get<unknown>(
		`/tenants/${tenantSlug}/catalog/brands/${id}`,
	);
	return BrandDetailSchema.parse(data);
}

export function useGetBrandQuery(
	tenantSlug: string,
	id: string,
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: ["brand", tenantSlug, id],
		queryFn: () => getBrandFn(tenantSlug, id),
		enabled: (options?.enabled ?? true) && !!tenantSlug && !!id,
		staleTime: 5 * 60 * 1000,
	});
}
