import { type DeletedCategory, DeletedCategorySchema } from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export type { DeletedCategory };

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
