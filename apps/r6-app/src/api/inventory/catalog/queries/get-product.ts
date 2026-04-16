import { type ProductDetail, ProductDetailSchema } from "@r6/schemas";
import { useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export type { ProductDetail };

export async function getProductFn(
	tenantSlug: string,
	id: string,
): Promise<ProductDetail> {
	const { data } = await inventoryApi.get<unknown>(
		`/tenants/${tenantSlug}/catalog/products/${id}`,
	);
	return ProductDetailSchema.parse(data);
}

export function useGetProductQuery(
	tenantSlug: string,
	id: string,
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: ["product", tenantSlug, id],
		queryFn: () => getProductFn(tenantSlug, id),
		enabled: (options?.enabled ?? true) && !!tenantSlug && !!id,
		staleTime: 5 * 60 * 1000,
	});
}
