import {
	type UpdateBrandInput,
	type UpdatedBrand,
	UpdatedBrandSchema,
} from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export type { UpdatedBrand };

export interface UpdateBrandParams {
	tenantSlug: string;
	id: string;
	body: UpdateBrandInput;
}

export async function updateBrandFn({
	tenantSlug,
	id,
	body,
}: UpdateBrandParams): Promise<UpdatedBrand> {
	const { data } = await inventoryApi.patch<unknown>(
		`/tenants/${tenantSlug}/catalog/brands/${id}`,
		body,
	);
	return UpdatedBrandSchema.parse(data);
}

export function useUpdateBrandMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: updateBrandFn,
		onSuccess: (_data, { tenantSlug, id }) => {
			queryClient.invalidateQueries({ queryKey: ["brands", tenantSlug] });
			queryClient.invalidateQueries({ queryKey: ["brand", tenantSlug, id] });
		},
	});
}
