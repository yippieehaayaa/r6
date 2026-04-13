import { type VariantDetail, VariantDetailSchema } from "@r6/schemas";
import { useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export type { VariantDetail };

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
