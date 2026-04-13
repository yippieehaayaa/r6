import { type Category, CategorySchema } from "@r6/schemas";
import { useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export async function getCategoryFn(
	tenantSlug: string,
	id: string,
): Promise<Category> {
	const { data } = await inventoryApi.get<unknown>(
		`/tenants/${tenantSlug}/catalog/categories/${id}`,
	);
	return CategorySchema.parse(data);
}

export function useGetCategoryQuery(
	tenantSlug: string,
	id: string,
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: ["category", tenantSlug, id],
		queryFn: () => getCategoryFn(tenantSlug, id),
		enabled: (options?.enabled ?? true) && !!tenantSlug && !!id,
		staleTime: 5 * 60 * 1000,
	});
}
