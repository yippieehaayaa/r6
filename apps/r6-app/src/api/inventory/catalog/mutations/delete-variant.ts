import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { inventoryApi } from "@/api/_app";

const DeletedVariantSchema = z.object({
	id: z.string(),
	tenantId: z.string(),
	productId: z.string(),
	sku: z.string(),
	name: z.string(),
	deletedAt: z.string().nullable(),
});

export type DeletedVariant = z.infer<typeof DeletedVariantSchema>;

export interface DeleteVariantParams {
	tenantSlug: string;
	id: string;
}

export async function deleteVariantFn({
	tenantSlug,
	id,
}: DeleteVariantParams): Promise<DeletedVariant> {
	const { data } = await inventoryApi.delete<unknown>(
		`/tenants/${tenantSlug}/catalog/variants/${id}`,
	);
	return DeletedVariantSchema.parse(data);
}

export function useDeleteVariantMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deleteVariantFn,
		onSuccess: (_data, { tenantSlug, id }) => {
			queryClient.invalidateQueries({ queryKey: ["variants", tenantSlug] });
			queryClient.removeQueries({ queryKey: ["variant", tenantSlug, id] });
			queryClient.invalidateQueries({ queryKey: ["product", tenantSlug] });
		},
	});
}
