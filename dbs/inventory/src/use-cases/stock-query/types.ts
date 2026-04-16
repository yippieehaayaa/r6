import type { InventoryItem } from "../../../generated/prisma/client.js";

export type { InventoryItem };

export type CheckAvailabilityInput = {
  tenantId: string;
  variantId: string;
  warehouseId: string;
};

export type CheckAvailabilityResult = {
  variantId: string;
  warehouseId: string;
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable: number;
};

export type CheckAvailabilityBatchInput = {
  tenantId: string;
  items: Array<{
    variantId: string;
    warehouseId: string;
  }>;
};

export type CheckAvailabilityBatchResult = {
  items: CheckAvailabilityResult[];
};
