import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { inventoryApi } from "@/api/_app";

const DeletedProductSchema = z.object({
	id: z.string(),
	tenantId: z.string(),
	sku: z.string(),
	name: z.string(),
	deletedAt: z.string().nullable(),
});

export type DeletedProduct = z.infer<typeof DeletedProductSchema>;

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
