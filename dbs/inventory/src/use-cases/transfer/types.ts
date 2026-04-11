import type {
  InventoryItem,
  InventoryLot,
  StockAlert,
  StockMovement,
  StockTransfer,
  StockTransferItem,
} from "../../../generated/prisma/client.js";

export type {
  InventoryItem,
  InventoryLot,
  StockAlert,
  StockMovement,
  StockTransfer,
  StockTransferItem,
};

export type DispatchTransferLineInput = {
  variantId: string;
  quantity: number;
};

export type DispatchTransferInput = {
  tenantId: string;
  performedBy: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  expectedAt?: Date;
  notes?: string;
  lines: DispatchTransferLineInput[];
};

export type LotShipment = {
  lot: InventoryLot;
  movement: StockMovement;
  transferItem: StockTransferItem;
  quantityShipped: number;
};

export type DispatchTransferLineResult = {
  lotShipments: LotShipment[];
  inventoryItem: InventoryItem;
  alerts: StockAlert[];
};

export type DispatchTransferResult = {
  transfer: StockTransfer;
  lines: DispatchTransferLineResult[];
};

export type ReceiveTransferLineInput = {
  transferItemId: string;
  quantityReceived: number;
};

export type ReceiveTransferInput = {
  tenantId: string;
  performedBy: string;
  transferId: string;
  lines: ReceiveTransferLineInput[];
};

export type ReceiveTransferLineResult = {
  transferItem: StockTransferItem;
  lot: InventoryLot;
  movement: StockMovement;
  inventoryItem: InventoryItem;
  alerts: StockAlert[];
};

export type ReceiveTransferResult = {
  transfer: StockTransfer;
  lines: ReceiveTransferLineResult[];
};
