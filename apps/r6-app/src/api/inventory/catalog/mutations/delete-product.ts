import { type DeletedProduct, DeletedProductSchema } from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export type { DeletedProduct };

export interface DeleteProductParams {
	tenantSlug: string;
	id: string;
}

export async function deleteProductFn({
	tenantSlug,
	id,
}: DeleteProductParams): Promise<DeletedProduct> {
	const { data } = await inventoryApi.delete<unknown>(
		`/tenants/${tenantSlug}/catalog/products/${id}`,
	);
	return DeletedProductSchema.parse(data);
}

export function useDeleteProductMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deleteProductFn,
		onSuccess: (_data, { tenantSlug, id }) => {
			queryClient.invalidateQueries({ queryKey: ["products", tenantSlug] });
			queryClient.removeQueries({ queryKey: ["product", tenantSlug, id] });
		},
	});
}
