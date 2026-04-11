import type {
  InventoryItem,
  StockMovement,
  StockReservation,
} from "../../../generated/prisma/client.js";

export type { InventoryItem, StockMovement, StockReservation };

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
