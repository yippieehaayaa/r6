import type {
  InventoryItem,
  InventoryLot,
  SerializedUnit,
  StockAlert,
  StockMovement,
  StockReservation,
} from "../../../generated/prisma/client.js";

export type {
  InventoryItem,
  InventoryLot,
  SerializedUnit,
  StockAlert,
  StockMovement,
  StockReservation,
};

export type ReserveStockLineInput = {
  variantId: string;
  warehouseId: string;
  quantity: number;
};

export type ReserveStockInput = {
  tenantId: string;
  reservedBy: string;
  referenceId: string;
  referenceType: string;
  lines: ReserveStockLineInput[];
};

export type ReserveStockLineResult = {
  reservation: StockReservation;
  movement: StockMovement;
  inventoryItem: InventoryItem;
};

export type ReserveStockResult = {
  lines: ReserveStockLineResult[];
};

export type ExpireReservationsResult = {
  expired: Array<{
    reservation: StockReservation;
    movement: StockMovement;
    inventoryItem: InventoryItem;
  }>;
};

export type FulfillSaleLineInput = {
  variantId: string;
  warehouseId: string;
  quantity: number;
  reservationId?: string;
  serialNumbers?: string[];
};

export type FulfillSaleInput = {
  tenantId: string;
  performedBy: string;
  referenceId: string;
  referenceType?: string;
  lines: FulfillSaleLineInput[];
};

export type LotConsumption = {
  lot: InventoryLot;
  movement: StockMovement;
  quantityDepleted: number;
};

export type FulfillSaleLineResult = {
  lotConsumptions: LotConsumption[];
  serializedUnits: SerializedUnit[];
  inventoryItem: InventoryItem;
  reservation: StockReservation | null;
  alerts: StockAlert[];
};

export type FulfillSaleResult = {
  lines: FulfillSaleLineResult[];
};
