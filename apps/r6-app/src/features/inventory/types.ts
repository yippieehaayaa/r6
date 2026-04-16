export type TrackingType = "NONE" | "SERIAL" | "BATCH";
export type ProductStatus = "DRAFT" | "ACTIVE" | "DISCONTINUED" | "ARCHIVED";
export type MovementType =
	| "RECEIPT"
	| "SALE"
	| "RETURN"
	| "ADJUSTMENT"
	| "TRANSFER_IN"
	| "TRANSFER_OUT"
	| "DAMAGE"
	| "RESERVATION"
	| "RESERVATION_RELEASE";
export type AlertType =
	| "LOW_STOCK"
	| "OUT_OF_STOCK"
	| "OVERSTOCK"
	| "LOT_EXPIRING"
	| "LOT_EXPIRED"
	| "COUNT_VARIANCE";
export type AlertStatus = "OPEN" | "ACKNOWLEDGED" | "RESOLVED";
export type CostingMethod = "FIFO" | "AVCO" | "FEFO";
export type TransferStatus =
	| "DRAFT"
	| "IN_TRANSIT"
	| "PARTIALLY_RECEIVED"
	| "COMPLETED"
	| "CANCELLED";
export type StockCountStatus =
	| "DRAFT"
	| "IN_PROGRESS"
	| "COMPLETED"
	| "CANCELLED";

export interface Product {
	id: string;
	sku: string;
	name: string;
	slug: string;
	status: ProductStatus;
	categoryName?: string;
	brandName?: string;
	tags: string[];
	createdAt: string;
}

export interface ProductVariant {
	id: string;
	productId: string;
	sku: string;
	name: string;
	barcode?: string;
	trackingType: TrackingType;
	options: Record<string, string>;
	baseUom: string;
	imageUrl?: string;
	product: Pick<Product, "id" | "name" | "sku" | "categoryName" | "brandName">;
}

export interface Warehouse {
	id: string;
	name: string;
	code: string;
	isActive: boolean;
}

export interface InventoryItem {
	id: string;
	variantId: string;
	warehouseId: string;
	quantityOnHand: number;
	quantityReserved: number;
	reorderPoint: number;
	overstockThreshold: number;
	variant: ProductVariant;
	warehouse: Warehouse;
}

export interface InventoryLot {
	id: string;
	variantId: string;
	warehouseId: string;
	lotNumber?: string;
	quantityReceived: number;
	quantityRemaining: number;
	unitCost: string;
	unitCostCurrency: string;
	receivedAt: string;
	expiresAt?: string;
	isQuarantined: boolean;
}

export interface StockMovement {
	id: string;
	variantId: string;
	warehouseId: string;
	movementType: MovementType;
	quantity: number;
	unitCostSnapshot?: string;
	referenceId?: string;
	referenceType?: string;
	performedBy: string;
	performedByName: string;
	createdAt: string;
	variant: Pick<ProductVariant, "id" | "sku" | "name">;
	warehouse: Pick<Warehouse, "id" | "name" | "code">;
}

export interface StockAlert {
	id: string;
	variantId: string;
	warehouseId: string;
	alertType: AlertType;
	alertStatus: AlertStatus;
	lotId?: string;
	threshold?: number;
	currentQuantity: number;
	notes?: string;
	acknowledgedAt?: string;
	acknowledgedBy?: string;
	resolvedAt?: string;
	resolvedBy?: string;
	createdAt: string;
	variant: Pick<ProductVariant, "id" | "sku" | "name">;
	warehouse: Pick<Warehouse, "id" | "name" | "code">;
}

export type StockStatus = "in-stock" | "low-stock" | "out-of-stock";

export interface SearchableVariant extends ProductVariant {
	inventoryItems: Array<{
		warehouseId: string;
		warehouseName: string;
		warehouseCode: string;
		quantityOnHand: number;
		quantityReserved: number;
		quantityAvailable: number;
		reorderPoint: number;
		status: StockStatus;
	}>;
	totalOnHand: number;
	totalAvailable: number;
	overallStatus: StockStatus;
}

export type StockActionType = "add" | "deduct";

export interface StockActionPayload {
	variantId: string;
	warehouseId: string;
	quantity: number;
	reason: string;
	referenceId?: string;
	notes?: string;
}
