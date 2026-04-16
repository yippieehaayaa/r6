import {
	type UpdateCategoryInput,
	type UpdatedCategory,
	UpdatedCategorySchema,
} from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export type { UpdatedCategory };

export interface UpdateCategoryParams {
	tenantSlug: string;
	id: string;
	body: UpdateCategoryInput;
}

export async function updateCategoryFn({
	tenantSlug,
	id,
	body,
}: UpdateCategoryParams): Promise<UpdatedCategory> {
	const { data } = await inventoryApi.patch<unknown>(
		`/tenants/${tenantSlug}/catalog/categories/${id}`,
		body,
	);
	return UpdatedCategorySchema.parse(data);
}

export function useUpdateCategoryMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: updateCategoryFn,
		onSuccess: (_data, { tenantSlug, id }) => {
			queryClient.invalidateQueries({ queryKey: ["categories", tenantSlug] });
			queryClient.invalidateQueries({
				queryKey: ["category", tenantSlug, id],
			});
		},
	});
}
