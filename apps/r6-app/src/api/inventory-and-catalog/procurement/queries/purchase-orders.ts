import {
	PaginatedResponseSchema,
	type PurchaseOrder,
	type PurchaseOrderItem,
	PurchaseOrderItemSchema,
	PurchaseOrderSchema,
} from "@r6/schemas";
import { useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export interface ListPurchaseOrdersParams {
	page?: number;
	limit?: number;
	supplierId?: string;
	warehouseId?: string;
	status?: string;
	from?: string;
	to?: string;
}

const ListOrdersResponseSchema = PaginatedResponseSchema(PurchaseOrderSchema);

export async function listPurchaseOrdersFn(
	params: ListPurchaseOrdersParams = {},
): Promise<{
	data: PurchaseOrder[];
	page: number;
	limit: number;
	total: number;
}> {
	const { data } = await inventoryApi.get<unknown>("/procurement/orders", {
		params,
	});
	return ListOrdersResponseSchema.parse(data);
}

export async function getPurchaseOrderFn(id: string): Promise<PurchaseOrder> {
	const { data } = await inventoryApi.get<unknown>(`/procurement/orders/${id}`);
	return PurchaseOrderSchema.parse(data);
}

export async function getPurchaseOrderItemsFn(
	orderId: string,
): Promise<PurchaseOrderItem[]> {
	const { data } = await inventoryApi.get<unknown>(
		`/procurement/orders/${orderId}/items`,
	);
	return PurchaseOrderItemSchema.array().parse(data);
}

export function useListPurchaseOrdersQuery(
	params: ListPurchaseOrdersParams = {},
	options?: { staleTime?: number; gcTime?: number; enabled?: boolean },
) {
	return useQuery({
		queryKey: ["purchase-orders", params],
		queryFn: () => listPurchaseOrdersFn(params),
		...options,
	});
}

export function useGetPurchaseOrderQuery(id: string) {
	return useQuery({
		queryKey: ["purchase-orders", id],
		queryFn: () => getPurchaseOrderFn(id),
		enabled: !!id,
	});
}

export function useGetPurchaseOrderItemsQuery(orderId: string) {
	return useQuery({
		queryKey: ["purchase-orders", orderId, "items"],
		queryFn: () => getPurchaseOrderItemsFn(orderId),
		enabled: !!orderId,
	});
}
