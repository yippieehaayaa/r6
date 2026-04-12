import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { inventoryApi } from "@/api/_app";

const DeletedBrandSchema = z.object({
	id: z.string(),
	tenantId: z.string(),
	name: z.string(),
	slug: z.string(),
	deletedAt: z.string().nullable(),
});

export type DeletedBrand = z.infer<typeof DeletedBrandSchema>;

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
