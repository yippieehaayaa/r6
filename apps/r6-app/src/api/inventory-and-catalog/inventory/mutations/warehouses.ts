import {
	type CreateWarehouse,
	CreateWarehouseSchema,
	type UpdateWarehouse,
	UpdateWarehouseSchema,
	type Warehouse,
	WarehouseSchema,
} from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export async function createWarehouseFn(
	body: CreateWarehouse,
): Promise<Warehouse> {
	const { data } = await inventoryApi.post<unknown>(
		"/inventory/warehouses",
		CreateWarehouseSchema.parse(body),
	);
	return WarehouseSchema.parse(data);
}

export async function updateWarehouseFn(
	id: string,
	body: UpdateWarehouse,
): Promise<Warehouse> {
	const { data } = await inventoryApi.patch<unknown>(
		`/inventory/warehouses/${id}`,
		UpdateWarehouseSchema.parse(body),
	);
	return WarehouseSchema.parse(data);
}

export async function deleteWarehouseFn(id: string): Promise<void> {
	await inventoryApi.delete(`/inventory/warehouses/${id}`);
}

export function useCreateWarehouseMutation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: createWarehouseFn,
		onSuccess: () => qc.invalidateQueries({ queryKey: ["warehouses"] }),
	});
}

export function useUpdateWarehouseMutation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, body }: { id: string; body: UpdateWarehouse }) =>
			updateWarehouseFn(id, body),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["warehouses"] }),
	});
}

export function useDeleteWarehouseMutation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: deleteWarehouseFn,
		onSuccess: () => qc.invalidateQueries({ queryKey: ["warehouses"] }),
	});
}
