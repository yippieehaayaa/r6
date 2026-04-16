import type {
  InventoryItem,
  StockAlert,
  StockCount,
  StockCountItem,
  StockMovement,
} from "../../../generated/prisma/client.js";

export type {
  InventoryItem,
  StockAlert,
  StockCount,
  StockCountItem,
  StockMovement,
};

export type StockCountItemScope = {
  variantId: string;
  lotId?: string;
  binLocationId?: string;
};

export type PrepareStockCountInput = {
  tenantId: string;
  performedBy: string;
  warehouseId: string;
  countType?: string;
  notes?: string;
  items?: StockCountItemScope[];
};

export type PrepareStockCountResult = {
  stockCount: StockCount;
  items: StockCountItem[];
};

export type RecordCountLineInput = {
  stockCountItemId: string;
  quantityActual: number;
};

export type RecordCountInput = {
  tenantId: string;
  performedBy: string;
  stockCountId: string;
  lines: RecordCountLineInput[];
};

export type RecordCountResult = {
  stockCount: StockCount;
  items: StockCountItem[];
};

export type ReconcileStockCountInput = {
  tenantId: string;
  performedBy: string;
  supervisedBy: string;
  stockCountId: string;
  varianceReasons?: Record<string, string>;
};

export type ReconcileLineResult = {
  item: StockCountItem;
  movements: StockMovement[];
  inventoryItem: InventoryItem;
  alerts: StockAlert[];
};

export type ReconcileStockCountResult = {
  stockCount: StockCount;
  lines: ReconcileLineResult[];
};
