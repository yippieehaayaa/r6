import { type DeletedBrand, DeletedBrandSchema } from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export type { DeletedBrand };

export interface DeleteBrandParams {
	tenantSlug: string;
	id: string;
}

export async function deleteBrandFn({
	tenantSlug,
	id,
}: DeleteBrandParams): Promise<DeletedBrand> {
	const { data } = await inventoryApi.delete<unknown>(
		`/tenants/${tenantSlug}/catalog/brands/${id}`,
	);
	return DeletedBrandSchema.parse(data);
}

export function useDeleteBrandMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deleteBrandFn,
		onSuccess: (_data, { tenantSlug, id }) => {
			queryClient.invalidateQueries({ queryKey: ["brands", tenantSlug] });
			queryClient.removeQueries({ queryKey: ["brand", tenantSlug, id] });
		},
	});
}
