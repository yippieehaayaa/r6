import { z } from "zod";

// ── Inventory Item ──────────────────────────────────────────

export const InventoryItemSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  variantId: z.string(),
  warehouseId: z.string(),
  quantityOnHand: z.number(),
  quantityReserved: z.number(),
  reorderPoint: z.number().nullable(),
  reorderQuantity: z.number().nullable(),
  overstockThreshold: z.number().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  variant: z.object({
    id: z.string(),
    sku: z.string(),
    name: z.string(),
    barcode: z.string().nullable(),
    trackingType: z.string(),
    isActive: z.boolean(),
    productId: z.string(),
    product: z.object({
      id: z.string(),
      sku: z.string(),
      name: z.string(),
      status: z.string(),
    }),
  }),
  warehouse: z.object({
    id: z.string(),
    name: z.string(),
    code: z.string(),
    isActive: z.boolean(),
  }),
});

export type InventoryItem = z.infer<typeof InventoryItemSchema>;

// ── Inventory Lot ───────────────────────────────────────────

export const InventoryLotSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  variantId: z.string(),
  warehouseId: z.string(),
  binLocationId: z.string().nullable(),
  lotNumber: z.string().nullable(),
  quantityReceived: z.number(),
  quantityRemaining: z.number(),
  unitCost: z.string(),
  unitCostCurrency: z.string(),
  receivedAt: z.string(),
  expiresAt: z.string().nullable(),
  manufacturedAt: z.string().nullable(),
  isQuarantined: z.boolean(),
  quarantineReason: z.string().nullable(),
  notes: z.string().nullable(),
  referenceId: z.string().nullable(),
  referenceType: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type InventoryLot = z.infer<typeof InventoryLotSchema>;

// ── Stock Movement ──────────────────────────────────────────

export const StockMovementSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  type: z.string(),
  quantity: z.number(),
  unitCostSnapshot: z.string().nullable(),
  costCurrency: z.string().nullable(),
  referenceId: z.string().nullable(),
  referenceType: z.string().nullable(),
  performedBy: z.string(),
  notes: z.string().nullable(),
  variantId: z.string(),
  warehouseId: z.string(),
  lotId: z.string().nullable(),
  createdAt: z.string(),
});

export type StockMovement = z.infer<typeof StockMovementSchema>;

// ── Stock Reservation ───────────────────────────────────────

export const StockReservationSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  variantId: z.string(),
  warehouseId: z.string(),
  quantity: z.number(),
  status: z.string(),
  expiresAt: z.string().nullable(),
  fulfilledAt: z.string().nullable(),
  releasedAt: z.string().nullable(),
  referenceId: z.string(),
  referenceType: z.string(),
  reservedBy: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type StockReservation = z.infer<typeof StockReservationSchema>;

// ── Correction Results ──────────────────────────────────────

export const InventoryItemSnapshotSchema = z.object({
  id: z.string(),
  variantId: z.string(),
  warehouseId: z.string(),
  quantityOnHand: z.number(),
  quantityReserved: z.number(),
  updatedAt: z.string(),
});

export type InventoryItemSnapshot = z.infer<typeof InventoryItemSnapshotSchema>;

export const ManualAdjustmentResultSchema = z.object({
  inventoryItem: InventoryItemSnapshotSchema,
  lotAdjustments: z.array(z.unknown()),
  auditLog: z.object({ id: z.string() }),
  alerts: z.array(z.unknown()),
});

export type ManualAdjustmentResult = z.infer<
  typeof ManualAdjustmentResultSchema
>;

export const WriteOffResultSchema = z.object({
  inventoryItem: InventoryItemSnapshotSchema,
  lot: z.object({
    id: z.string(),
    lotNumber: z.string().nullable(),
    quantityRemaining: z.number(),
  }),
  movement: z.object({ id: z.string() }),
  auditLog: z.object({ id: z.string() }),
  alerts: z.array(z.unknown()),
});

export type WriteOffResult = z.infer<typeof WriteOffResultSchema>;
