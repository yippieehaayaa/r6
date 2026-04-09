import {
	type CreateProductVariant,
	CreateProductVariantSchema,
	type ProductVariant,
	ProductVariantSchema,
	type UpdateProductVariant,
	UpdateProductVariantSchema,
} from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export async function createVariantFn(
	productId: string,
	body: CreateProductVariant,
): Promise<ProductVariant> {
	const { data } = await inventoryApi.post<unknown>(
		`/catalog/products/${productId}/variants`,
		CreateProductVariantSchema.parse(body),
	);
	return ProductVariantSchema.parse(data);
}

export async function updateVariantFn(
	id: string,
	body: UpdateProductVariant,
): Promise<ProductVariant> {
	const { data } = await inventoryApi.patch<unknown>(
		`/catalog/variants/${id}`,
		UpdateProductVariantSchema.parse(body),
	);
	return ProductVariantSchema.parse(data);
}

export async function deleteVariantFn(id: string): Promise<void> {
	await inventoryApi.delete(`/catalog/variants/${id}`);
}

export function useCreateVariantMutation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({
			productId,
			body,
		}: {
			productId: string;
			body: CreateProductVariant;
		}) => createVariantFn(productId, body),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["variants"] }),
	});
}

export function useUpdateVariantMutation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, body }: { id: string; body: UpdateProductVariant }) =>
			updateVariantFn(id, body),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["variants"] }),
	});
}

export function useDeleteVariantMutation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: deleteVariantFn,
		onSuccess: () => qc.invalidateQueries({ queryKey: ["variants"] }),
	});
}
