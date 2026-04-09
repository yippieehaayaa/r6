import {
	PaginatedResponseSchema,
	type PurchaseOrder,
	type PurchaseOrderItem,
	PurchaseOrderItemSchema,
	PurchaseOrderSchema,
} from "@r6/schemas";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";
import { procurementKeys } from "../keys";

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

export function useListPurchaseOrdersQuery(
	params: ListPurchaseOrdersParams = {},
	options?: { staleTime?: number; gcTime?: number; enabled?: boolean },
) {
	return useQuery({
		queryKey: procurementKeys.orders.list(params),
		queryFn: () => listPurchaseOrdersFn(params),
		staleTime: 1000 * 60 * 2,
		gcTime: 1000 * 60 * 10,
		placeholderData: keepPreviousData,
		...options,
	});
}

export function useGetPurchaseOrderQuery(id: string) {
	return useQuery({
		queryKey: procurementKeys.orders.detail(id),
		queryFn: () => getPurchaseOrderFn(id),
		enabled: !!id,
		staleTime: 1000 * 60 * 5,
	});
}
