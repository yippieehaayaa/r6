import type { UpdateCategoryInput } from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { inventoryApi } from "@/api/_app";

const UpdatedCategorySchema = z.object({
	id: z.string(),
	tenantId: z.string(),
	name: z.string(),
	slug: z.string(),
	description: z.string().nullable(),
	parentId: z.string().nullable(),
	path: z.string(),
	sortOrder: z.number(),
	isActive: z.boolean(),
	updatedAt: z.string(),
});

export type UpdatedCategory = z.infer<typeof UpdatedCategorySchema>;

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
