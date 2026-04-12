import type { UpdateProductInput } from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { inventoryApi } from "@/api/_app";

const UpdatedProductSchema = z.object({
	id: z.string(),
	tenantId: z.string(),
	sku: z.string(),
	name: z.string(),
	slug: z.string(),
	description: z.string().nullable(),
	tags: z.array(z.string()),
	metadata: z.record(z.string(), z.unknown()).nullable(),
	status: z.string(),
	categoryId: z.string().nullable(),
	brandId: z.string().nullable(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export type UpdatedProduct = z.infer<typeof UpdatedProductSchema>;

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
