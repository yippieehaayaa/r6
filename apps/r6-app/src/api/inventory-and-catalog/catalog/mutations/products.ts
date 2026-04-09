import {
	type CreateProduct,
	CreateProductSchema,
	type Product,
	ProductSchema,
	type UpdateProduct,
	UpdateProductSchema,
} from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";
import { catalogKeys } from "../keys";

export async function createProductFn(body: CreateProduct): Promise<Product> {
	const { data } = await inventoryApi.post<unknown>(
		"/catalog/products",
		CreateProductSchema.parse(body),
	);
	return ProductSchema.parse(data);
}

export async function updateProductFn(
	id: string,
	body: UpdateProduct,
): Promise<Product> {
	const { data } = await inventoryApi.patch<unknown>(
		`/catalog/products/${id}`,
		UpdateProductSchema.parse(body),
	);
	return ProductSchema.parse(data);
}

export async function deleteProductFn(id: string): Promise<void> {
	await inventoryApi.delete(`/catalog/products/${id}`);
}

export async function publishProductFn(id: string): Promise<Product> {
	const { data } = await inventoryApi.post<unknown>(
		`/catalog/products/${id}/publish`,
	);
	return ProductSchema.parse(data);
}

export async function discontinueProductFn(id: string): Promise<Product> {
	const { data } = await inventoryApi.post<unknown>(
		`/catalog/products/${id}/discontinue`,
	);
	return ProductSchema.parse(data);
}

export async function archiveProductFn(id: string): Promise<Product> {
	const { data } = await inventoryApi.post<unknown>(
		`/catalog/products/${id}/archive`,
	);
	return ProductSchema.parse(data);
}

export function useCreateProductMutation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: createProductFn,
		onSuccess: () =>
			qc.invalidateQueries({ queryKey: catalogKeys.products.all() }),
	});
}

export function useUpdateProductMutation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, body }: { id: string; body: UpdateProduct }) =>
			updateProductFn(id, body),
		onSuccess: () =>
			qc.invalidateQueries({ queryKey: catalogKeys.products.all() }),
	});
}

export function useDeleteProductMutation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: deleteProductFn,
		onSuccess: () =>
			qc.invalidateQueries({ queryKey: catalogKeys.products.all() }),
	});
}

export function usePublishProductMutation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: publishProductFn,
		onSuccess: () =>
			qc.invalidateQueries({ queryKey: catalogKeys.products.all() }),
	});
}

export function useDiscontinueProductMutation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: discontinueProductFn,
		onSuccess: () =>
			qc.invalidateQueries({ queryKey: catalogKeys.products.all() }),
	});
}

export function useArchiveProductMutation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: archiveProductFn,
		onSuccess: () =>
			qc.invalidateQueries({ queryKey: catalogKeys.products.all() }),
	});
}
