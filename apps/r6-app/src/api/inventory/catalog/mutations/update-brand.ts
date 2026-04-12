import type { UpdateBrandInput } from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { inventoryApi } from "@/api/_app";

const UpdatedBrandSchema = z.object({
	id: z.string(),
	tenantId: z.string(),
	name: z.string(),
	slug: z.string(),
	description: z.string().nullable(),
	logoUrl: z.string().nullable(),
	isActive: z.boolean(),
	updatedAt: z.string(),
});

export type UpdatedBrand = z.infer<typeof UpdatedBrandSchema>;

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
