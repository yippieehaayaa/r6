import {
	type UpdatedVariant,
	UpdatedVariantSchema,
	type UpdateVariantInput,
} from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export type { UpdatedVariant };

export interface UpdateVariantParams {
	tenantSlug: string;
	id: string;
	body: UpdateVariantInput;
}

export async function updateVariantFn({
	tenantSlug,
	id,
	body,
}: UpdateVariantParams): Promise<UpdatedVariant> {
	const { data } = await inventoryApi.patch<unknown>(
		`/tenants/${tenantSlug}/catalog/variants/${id}`,
		body,
	);
	return UpdatedVariantSchema.parse(data);
}

export function useUpdateVariantMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: updateVariantFn,
		onSuccess: (_data, { tenantSlug, id }) => {
			queryClient.invalidateQueries({ queryKey: ["variants", tenantSlug] });
			queryClient.invalidateQueries({ queryKey: ["variant", tenantSlug, id] });
			// Variant changes may affect product detail (variant list within product)
			queryClient.invalidateQueries({ queryKey: ["product", tenantSlug] });
		},
	});
}
