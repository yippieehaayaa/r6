import {
	type CreateSupplier,
	CreateSupplierSchema,
	type Supplier,
	SupplierSchema,
	type UpdateSupplier,
	UpdateSupplierSchema,
} from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";
import { procurementKeys } from "../keys";

export async function createSupplierFn(
	body: CreateSupplier,
): Promise<Supplier> {
	const { data } = await inventoryApi.post<unknown>(
		"/procurement/suppliers",
		CreateSupplierSchema.parse(body),
	);
	return SupplierSchema.parse(data);
}

export async function updateSupplierFn(
	id: string,
	body: UpdateSupplier,
): Promise<Supplier> {
	const { data } = await inventoryApi.patch<unknown>(
		`/procurement/suppliers/${id}`,
		UpdateSupplierSchema.parse(body),
	);
	return SupplierSchema.parse(data);
}

export async function deleteSupplierFn(id: string): Promise<void> {
	await inventoryApi.delete(`/procurement/suppliers/${id}`);
}

export function useCreateSupplierMutation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: createSupplierFn,
		onSuccess: () => qc.invalidateQueries({ queryKey: procurementKeys.suppliers.all() }),
	});
}

export function useUpdateSupplierMutation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, body }: { id: string; body: UpdateSupplier }) =>
			updateSupplierFn(id, body),
		onSuccess: () => qc.invalidateQueries({ queryKey: procurementKeys.suppliers.all() }),
	});
}

export function useDeleteSupplierMutation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: deleteSupplierFn,
		onSuccess: () => qc.invalidateQueries({ queryKey: procurementKeys.suppliers.all() }),
	});
}
