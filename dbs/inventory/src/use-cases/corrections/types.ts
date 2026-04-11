import type {
  AuditLog,
  InventoryItem,
  InventoryLot,
  SerializedUnit,
  StockAlert,
  StockMovement,
} from "../../../generated/prisma/client.js";

export type {
  AuditLog,
  InventoryItem,
  InventoryLot,
  SerializedUnit,
  StockAlert,
  StockMovement,
};

export type ManualAdjustmentInput = {
  tenantId: string;
  performedBy: string;
  variantId: string;
  warehouseId: string;
  quantityDelta: number;
  reason: string;
};

export type LotAdjustment = {
  lot: InventoryLot;
  movement: StockMovement;
  quantityAdjusted: number;
};

export type ManualAdjustmentResult = {
  lotAdjustments: LotAdjustment[];
  inventoryItem: InventoryItem;
  auditLog: AuditLog;
  alerts: StockAlert[];
};

export type WriteOffStockInput = {
  tenantId: string;
  performedBy: string;
  lotId: string;
  reason: string;
};

export type WriteOffStockResult = {
  lot: InventoryLot;
  movement: StockMovement;
  inventoryItem: InventoryItem;
  serializedUnits: SerializedUnit[];
  auditLog: AuditLog;
  alerts: StockAlert[];
};
