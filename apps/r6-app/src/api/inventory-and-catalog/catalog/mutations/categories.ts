import {
	type Category,
	CategorySchema,
	type CreateCategory,
	CreateCategorySchema,
	type UpdateCategory,
	UpdateCategorySchema,
} from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export async function createCategoryFn(
	body: CreateCategory,
): Promise<Category> {
	const { data } = await inventoryApi.post<unknown>(
		"/catalog/categories",
		CreateCategorySchema.parse(body),
	);
	return CategorySchema.parse(data);
}

export async function updateCategoryFn(
	id: string,
	body: UpdateCategory,
): Promise<Category> {
	const { data } = await inventoryApi.patch<unknown>(
		`/catalog/categories/${id}`,
		UpdateCategorySchema.parse(body),
	);
	return CategorySchema.parse(data);
}

export async function deleteCategoryFn(id: string): Promise<void> {
	await inventoryApi.delete(`/catalog/categories/${id}`);
}

export function useCreateCategoryMutation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: createCategoryFn,
		onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
	});
}

export function useUpdateCategoryMutation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, body }: { id: string; body: UpdateCategory }) =>
			updateCategoryFn(id, body),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
	});
}

export function useDeleteCategoryMutation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: deleteCategoryFn,
		onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
	});
}
