import { PaginatedResponseSchema } from "@r6/schemas";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { inventoryApi } from "@/api/_app";

export interface ListCategoriesParams {
	page?: number;
	limit?: number;
	search?: string;
	/** Pass the string "null" to fetch only top-level (parentless) categories */
	parentId?: string;
	isActive?: boolean;
}

const CategorySummarySchema = z.object({
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

export type CategorySummary = z.infer<typeof CategorySummarySchema>;

const CategoryListResponseSchema = PaginatedResponseSchema(
	CategorySummarySchema,
);

export async function listCategoriesFn(
	tenantSlug: string,
	params: ListCategoriesParams = {},
) {
	const { data } = await inventoryApi.get<unknown>(
		`/tenants/${tenantSlug}/catalog/categories`,
		{ params },
	);
	return CategoryListResponseSchema.parse(data);
}

export function useListCategoriesQuery(
	tenantSlug: string,
	params: ListCategoriesParams = {},
	options?: { staleTime?: number },
) {
	return useQuery({
		queryKey: ["categories", tenantSlug, params],
		queryFn: () => listCategoriesFn(tenantSlug, params),
		enabled: !!tenantSlug,
		placeholderData: keepPreviousData,
		staleTime: options?.staleTime ?? 5 * 60 * 1000,
	});
}
