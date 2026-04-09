import {
	type CreatePurchaseOrder,
	type CreatePurchaseOrderItem,
	CreatePurchaseOrderItemSchema,
	CreatePurchaseOrderSchema,
	type PurchaseOrder,
	type PurchaseOrderItem,
	PurchaseOrderItemSchema,
	PurchaseOrderSchema,
	type UpdatePurchaseOrder,
	type UpdatePurchaseOrderItem,
	UpdatePurchaseOrderItemSchema,
	UpdatePurchaseOrderSchema,
} from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export async function createPurchaseOrderFn(
	body: CreatePurchaseOrder,
): Promise<PurchaseOrder> {
	const { data } = await inventoryApi.post<unknown>(
		"/procurement/orders",
		CreatePurchaseOrderSchema.parse(body),
	);
	return PurchaseOrderSchema.parse(data);
}

export async function updatePurchaseOrderFn(
	id: string,
	body: UpdatePurchaseOrder,
): Promise<PurchaseOrder> {
	const { data } = await inventoryApi.patch<unknown>(
		`/procurement/orders/${id}`,
		UpdatePurchaseOrderSchema.parse(body),
	);
	return PurchaseOrderSchema.parse(data);
}

export async function deletePurchaseOrderFn(id: string): Promise<void> {
	await inventoryApi.delete(`/procurement/orders/${id}`);
}

export async function sendPurchaseOrderFn(id: string): Promise<PurchaseOrder> {
	const { data } = await inventoryApi.post<unknown>(
		`/procurement/orders/${id}/send`,
	);
	return PurchaseOrderSchema.parse(data);
}

export async function confirmPurchaseOrderFn(
	id: string,
): Promise<PurchaseOrder> {
	const { data } = await inventoryApi.post<unknown>(
		`/procurement/orders/${id}/confirm`,
	);
	return PurchaseOrderSchema.parse(data);
}

export async function cancelPurchaseOrderFn(
	id: string,
): Promise<PurchaseOrder> {
	const { data } = await inventoryApi.post<unknown>(
		`/procurement/orders/${id}/cancel`,
	);
	return PurchaseOrderSchema.parse(data);
}

export interface ReceiptItem {
	variantId: string;
	quantityReceived: number;
}

export async function receivePurchaseOrderFn(
	id: string,
	receipts: ReceiptItem[],
	performedBy: string,
): Promise<PurchaseOrder> {
	const { data } = await inventoryApi.post<unknown>(
		`/procurement/orders/${id}/receive`,
		{ receipts, performedBy },
	);
	return PurchaseOrderSchema.parse(data);
}

export async function addItemToOrderFn(
	orderId: string,
	body: CreatePurchaseOrderItem,
): Promise<PurchaseOrderItem> {
	const { data } = await inventoryApi.post<unknown>(
		`/procurement/orders/${orderId}/items`,
		CreatePurchaseOrderItemSchema.parse(body),
	);
	return PurchaseOrderItemSchema.parse(data);
}

export async function updateOrderItemFn(
	orderId: string,
	variantId: string,
	body: UpdatePurchaseOrderItem,
): Promise<PurchaseOrderItem> {
	const { data } = await inventoryApi.patch<unknown>(
		`/procurement/orders/${orderId}/items/${variantId}`,
		UpdatePurchaseOrderItemSchema.parse(body),
	);
	return PurchaseOrderItemSchema.parse(data);
}

export async function removeItemFromOrderFn(
	orderId: string,
	variantId: string,
): Promise<void> {
	await inventoryApi.delete(
		`/procurement/orders/${orderId}/items/${variantId}`,
	);
}

export function useCreatePurchaseOrderMutation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: createPurchaseOrderFn,
		onSuccess: () => qc.invalidateQueries({ queryKey: ["purchase-orders"] }),
	});
}

export function useUpdatePurchaseOrderMutation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, body }: { id: string; body: UpdatePurchaseOrder }) =>
			updatePurchaseOrderFn(id, body),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["purchase-orders"] }),
	});
}

export function useDeletePurchaseOrderMutation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: deletePurchaseOrderFn,
		onSuccess: () => qc.invalidateQueries({ queryKey: ["purchase-orders"] }),
	});
}

export function useSendPurchaseOrderMutation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: sendPurchaseOrderFn,
		onSuccess: () => qc.invalidateQueries({ queryKey: ["purchase-orders"] }),
	});
}

export function useConfirmPurchaseOrderMutation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: confirmPurchaseOrderFn,
		onSuccess: () => qc.invalidateQueries({ queryKey: ["purchase-orders"] }),
	});
}

export function useCancelPurchaseOrderMutation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: cancelPurchaseOrderFn,
		onSuccess: () => qc.invalidateQueries({ queryKey: ["purchase-orders"] }),
	});
}

export function useReceivePurchaseOrderMutation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({
			id,
			receipts,
			performedBy,
		}: {
			id: string;
			receipts: ReceiptItem[];
			performedBy: string;
		}) => receivePurchaseOrderFn(id, receipts, performedBy),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["purchase-orders"] });
			qc.invalidateQueries({ queryKey: ["stock"] });
		},
	});
}

export function useAddItemToOrderMutation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({
			orderId,
			body,
		}: {
			orderId: string;
			body: CreatePurchaseOrderItem;
		}) => addItemToOrderFn(orderId, body),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["purchase-orders"] }),
	});
}

export function useUpdateOrderItemMutation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({
			orderId,
			variantId,
			body,
		}: {
			orderId: string;
			variantId: string;
			body: UpdatePurchaseOrderItem;
		}) => updateOrderItemFn(orderId, variantId, body),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["purchase-orders"] }),
	});
}

export function useRemoveItemFromOrderMutation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({
			orderId,
			variantId,
		}: {
			orderId: string;
			variantId: string;
		}) => removeItemFromOrderFn(orderId, variantId),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["purchase-orders"] }),
	});
}
