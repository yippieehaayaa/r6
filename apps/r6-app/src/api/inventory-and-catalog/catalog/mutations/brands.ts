import {
	type Brand,
	BrandSchema,
	type CreateBrand,
	CreateBrandSchema,
	type UpdateBrand,
	UpdateBrandSchema,
} from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";
import { catalogKeys } from "../keys";

export async function createBrandFn(body: CreateBrand): Promise<Brand> {
	const { data } = await inventoryApi.post<unknown>(
		"/catalog/brands",
		CreateBrandSchema.parse(body),
	);
	return BrandSchema.parse(data);
}

export async function updateBrandFn(
	id: string,
	body: UpdateBrand,
): Promise<Brand> {
	const { data } = await inventoryApi.patch<unknown>(
		`/catalog/brands/${id}`,
		UpdateBrandSchema.parse(body),
	);
	return BrandSchema.parse(data);
}

export async function deleteBrandFn(id: string): Promise<void> {
	await inventoryApi.delete(`/catalog/brands/${id}`);
}

export function useCreateBrandMutation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: createBrandFn,
		onSuccess: () =>
			qc.invalidateQueries({ queryKey: catalogKeys.brands.all() }),
	});
}

export function useUpdateBrandMutation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, body }: { id: string; body: UpdateBrand }) =>
			updateBrandFn(id, body),
		onSuccess: () =>
			qc.invalidateQueries({ queryKey: catalogKeys.brands.all() }),
	});
}

export function useDeleteBrandMutation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: deleteBrandFn,
		onSuccess: () =>
			qc.invalidateQueries({ queryKey: catalogKeys.brands.all() }),
	});
}
