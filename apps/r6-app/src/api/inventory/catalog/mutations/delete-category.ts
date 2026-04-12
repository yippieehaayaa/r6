import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { inventoryApi } from "@/api/_app";

const DeletedCategorySchema = z.object({
	id: z.string(),
	tenantId: z.string(),
	name: z.string(),
	slug: z.string(),
	deletedAt: z.string().nullable(),
});

export type DeletedCategory = z.infer<typeof DeletedCategorySchema>;

export interface DeleteCategoryParams {
	tenantSlug: string;
	id: string;
}

export async function deleteCategoryFn({
	tenantSlug,
	id,
}: DeleteCategoryParams): Promise<DeletedCategory> {
	const { data } = await inventoryApi.delete<unknown>(
		`/tenants/${tenantSlug}/catalog/categories/${id}`,
	);
	return DeletedCategorySchema.parse(data);
}

export function useDeleteCategoryMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deleteCategoryFn,
		onSuccess: (_data, { tenantSlug, id }) => {
			queryClient.invalidateQueries({ queryKey: ["categories", tenantSlug] });
			queryClient.removeQueries({ queryKey: ["category", tenantSlug, id] });
		},
	});
}
