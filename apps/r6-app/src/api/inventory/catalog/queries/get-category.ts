import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { inventoryApi } from "@/api/_app";

const CategoryDetailSchema = z.object({
	id: z.string(),
	tenantId: z.string(),
	name: z.string(),
	slug: z.string(),
	description: z.string().nullable(),
	parentId: z.string().nullable(),
	path: z.string(),
	sortOrder: z.number(),
	isActive: z.boolean(),
	createdAt: z.string(),
	updatedAt: z.string(),
	parent: z
		.object({ id: z.string(), name: z.string(), slug: z.string() })
		.nullable(),
	_count: z.object({ children: z.number(), products: z.number() }),
});

export type CategoryDetail = z.infer<typeof CategoryDetailSchema>;

export async function getCategoryFn(
	tenantSlug: string,
	id: string,
): Promise<CategoryDetail> {
	const { data } = await inventoryApi.get<unknown>(
		`/tenants/${tenantSlug}/catalog/categories/${id}`,
	);
	return CategoryDetailSchema.parse(data);
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
