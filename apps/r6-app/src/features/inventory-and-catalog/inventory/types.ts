export interface InventoryRow {
	id: string;
	variantName: string;
	sku: string;
	variantId: string;
	warehouseId: string;
	warehouseName: string;
	quantityOnHand: number;
	quantityReserved: number;
	quantityAvailable: number;
	reorderPoint: number;
	status: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
	updatedAt: string;
}

export type StockStatusFilter = "all" | "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export interface StockCounts {
	total: number;
	inStock: number;
	lowStock: number;
	outOfStock: number;
}

export function computeStatus(
	onHand: number,
	reorderPoint: number,
): InventoryRow["status"] {
	if (onHand === 0) return "OUT_OF_STOCK";
	if (onHand <= reorderPoint) return "LOW_STOCK";
	return "IN_STOCK";
}
