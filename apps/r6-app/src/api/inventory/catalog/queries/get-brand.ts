import { type Brand, BrandSchema } from "@r6/schemas";
import { useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export async function getBrandFn(
	tenantSlug: string,
	id: string,
): Promise<Brand> {
	const { data } = await inventoryApi.get<unknown>(
		`/tenants/${tenantSlug}/catalog/brands/${id}`,
	);
	return BrandSchema.parse(data);
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
