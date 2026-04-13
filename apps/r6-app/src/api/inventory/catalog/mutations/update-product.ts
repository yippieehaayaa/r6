import {
	type UpdatedProduct,
	UpdatedProductSchema,
	type UpdateProductInput,
} from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export type { UpdatedProduct };

export interface UpdateProductParams {
	tenantSlug: string;
	id: string;
	body: UpdateProductInput;
}

export async function updateProductFn({
	tenantSlug,
	id,
	body,
}: UpdateProductParams): Promise<UpdatedProduct> {
	const { data } = await inventoryApi.patch<unknown>(
		`/tenants/${tenantSlug}/catalog/products/${id}`,
		body,
	);
	return UpdatedProductSchema.parse(data);
}

export function useUpdateProductMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: updateProductFn,
		onSuccess: (_data, { tenantSlug, id }) => {
			queryClient.invalidateQueries({ queryKey: ["products", tenantSlug] });
			queryClient.invalidateQueries({ queryKey: ["product", tenantSlug, id] });
		},
	});
}
