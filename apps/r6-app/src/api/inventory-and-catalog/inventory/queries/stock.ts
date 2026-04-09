import { type InventoryItem, InventoryItemSchema } from "@r6/schemas";
import { useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

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
		queryKey: ["stock", variantId, warehouseId],
		queryFn: () => getStockForVariantFn(variantId, warehouseId),
		enabled: !!variantId && !!warehouseId,
	});
}

export function useGetStockForProductQuery(productId: string) {
	return useQuery({
		queryKey: ["stock", "product", productId],
		queryFn: () => getStockForProductFn(productId),
		enabled: !!productId,
	});
}

export function useGetLowStockItemsQuery(warehouseId?: string) {
	return useQuery({
		queryKey: ["stock", "low-stock", warehouseId],
		queryFn: () => getLowStockItemsFn(warehouseId),
	});
}
