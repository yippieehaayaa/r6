import { type InventoryItem, InventoryItemSchema } from "@r6/schemas";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";
import { inventoryKeys } from "../keys";

export async function getStockForVariantFn(
	variantId: string,
	warehouseId: string,
): Promise<InventoryItem> {
	const { data } = await inventoryApi.get<unknown>(
		`/inventory/stock/${variantId}/${warehouseId}`,
	);
	return InventoryItemSchema.parse(data);
}

export async function getStockForProductFn(
	productId: string,
): Promise<InventoryItem[]> {
	const { data } = await inventoryApi.get<unknown>(
		`/inventory/stock/product/${productId}`,
	);
	return InventoryItemSchema.array().parse(data);
}

export async function getLowStockItemsFn(
	warehouseId?: string,
): Promise<InventoryItem[]> {
	const { data } = await inventoryApi.get<unknown>("/inventory/low-stock", {
		params: warehouseId ? { warehouseId } : undefined,
	});
	return InventoryItemSchema.array().parse(data);
}

export function useGetStockForVariantQuery(
	variantId: string,
	warehouseId: string,
) {
	return useQuery({
		queryKey: inventoryKeys.stock.forVariant(variantId, warehouseId),
		queryFn: () => getStockForVariantFn(variantId, warehouseId),
		enabled: !!variantId && !!warehouseId,
		staleTime: 1000 * 60 * 2,
	});
}

export function useGetStockForProductQuery(productId: string) {
	return useQuery({
		queryKey: inventoryKeys.stock.forProduct(productId),
		queryFn: () => getStockForProductFn(productId),
		enabled: !!productId,
		staleTime: 1000 * 60 * 2,
	});
}

export function useGetLowStockItemsQuery(warehouseId?: string) {
	return useQuery({
		queryKey: inventoryKeys.stock.lowStock(warehouseId),
		queryFn: () => getLowStockItemsFn(warehouseId),
		staleTime: 1000 * 60 * 2,
		gcTime: 1000 * 60 * 10,
		placeholderData: keepPreviousData,
	});
}
