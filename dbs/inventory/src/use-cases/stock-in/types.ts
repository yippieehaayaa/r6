import type {
  InventoryItem,
  InventoryLot,
  SerializedUnit,
  StockAlert,
  StockMovement,
} from "../../../generated/prisma/client.js";

export type {
  InventoryItem,
  InventoryLot,
  SerializedUnit,
  StockAlert,
  StockMovement,
};

export type ReceiveStockLineInput = {
  variantId: string;
  warehouseId: string;
  binLocationId?: string;
  quantityReceived: number;
  unitCost: string;
  unitCostCurrency?: string;

  lotNumber?: string;
  expiresAt?: Date;
  manufacturedAt?: Date;
  notes?: string;

  serialNumbers?: string[];
};

export type ReceiveStockInput = {
  tenantId: string;
  performedBy: string;
  referenceId: string;
  referenceType?: string;
  receivedAt: Date;
  lines: ReceiveStockLineInput[];
};

export type ReceiveStockLineResult = {
  lot: InventoryLot;
  serializedUnits: SerializedUnit[];
  movement: StockMovement;
  inventoryItem: InventoryItem;
  alerts: StockAlert[];
};

export type ReceiveStockResult = {
  lines: ReceiveStockLineResult[];
};
