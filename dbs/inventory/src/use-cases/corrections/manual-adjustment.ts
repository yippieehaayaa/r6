import { prisma } from "../../client.js";
import type { TransactionClient } from "../_shared/audit.js";
import { writeAuditLog } from "../_shared/audit.js";
import type {
  LotAdjustment,
  ManualAdjustmentInput,
  ManualAdjustmentResult,
} from "./types.js";

const manualAdjustment = async (
  input: ManualAdjustmentInput,
): Promise<ManualAdjustmentResult> => {
  if (input.quantityDelta === 0) {
    throw new Error("quantityDelta must not be zero");
  }
  if (!input.reason.trim()) {
    throw new Error("reason is required for manual adjustments");
  }

  return prisma.$transaction(async (tx) => {
    const config = await tx.tenantInventoryConfig.findUnique({
      where: { tenantId: input.tenantId },
    });
    if (!config) {
      throw new Error(`Tenant ${input.tenantId} has not been onboarded`);
    }

    const [variant, warehouse] = await Promise.all([
      tx.productVariant.findFirst({
        where: {
          id: input.variantId,
          tenantId: input.tenantId,
          deletedAt: null,
        },
      }),
      tx.warehouse.findFirst({
        where: {
          id: input.warehouseId,
          tenantId: input.tenantId,
          isActive: true,
          deletedAt: null,
        },
      }),
    ]);

    if (!variant) {
      throw new Error(`Variant ${input.variantId} not found or deleted`);
    }
    if (!warehouse) {
      throw new Error(
        `Warehouse ${input.warehouseId} not found, inactive, or deleted`,
      );
    }

    const existingItem = await tx.inventoryItem.findUnique({
      where: {
        tenantId_variantId_warehouseId: {
          tenantId: input.tenantId,
          variantId: input.variantId,
          warehouseId: input.warehouseId,
        },
      },
    });

    const isNegative = input.quantityDelta < 0;
    let lotAdjustments: LotAdjustment[];

    if (isNegative) {
      if (!existingItem) {
        throw new Error(
          `No inventory record for variant ${input.variantId} at warehouse ${input.warehouseId}`,
        );
      }
      lotAdjustments = await depleteLots(
        tx,
        input.tenantId,
        input.variantId,
        input.warehouseId,
        Math.abs(input.quantityDelta),
        config.costingMethod,
        input.performedBy,
        input.reason,
      );
    } else {
      lotAdjustments = await addPositiveAdjustment(
        tx,
        input.tenantId,
        input.variantId,
        input.warehouseId,
        input.quantityDelta,
        input.performedBy,
        input.reason,
      );
    }

    const before = existingItem ? { ...existingItem } : null;

    const inventoryItem = existingItem
      ? await tx.inventoryItem.update({
          where: { id: existingItem.id },
          data: { quantityOnHand: { increment: input.quantityDelta } },
        })
      : await tx.inventoryItem.create({
          data: {
            tenantId: input.tenantId,
            variantId: input.variantId,
            warehouseId: input.warehouseId,
            quantityOnHand: input.quantityDelta,
          },
        });

    const auditLog = await writeAuditLog(tx, {
      tenantId: input.tenantId,
      entityType: "InventoryItem",
      entityId: inventoryItem.id,
      action: before ? "UPDATE" : "CREATE",
      changedBy: input.performedBy,
      before,
      after: inventoryItem,
    });

    const quantityAvailable =
      inventoryItem.quantityOnHand - inventoryItem.quantityReserved;
    const alerts = isNegative
      ? await checkLowStockAlert(
          tx,
          input.tenantId,
          input.variantId,
          input.warehouseId,
          quantityAvailable,
          inventoryItem.reorderPoint,
        )
      : await checkOverstockAlert(
          tx,
          input.tenantId,
          input.variantId,
          input.warehouseId,
          inventoryItem.quantityOnHand,
          inventoryItem.overstockThreshold,
        );

    return { lotAdjustments, inventoryItem, auditLog, alerts };
  });
};

const depleteLots = async (
  tx: TransactionClient,
  tenantId: string,
  variantId: string,
  warehouseId: string,
  quantity: number,
  costingMethod: string,
  performedBy: string,
  reason: string,
): Promise<LotAdjustment[]> => {
  const orderBy =
    costingMethod === "FEFO"
      ? [
          { expiresAt: { sort: "asc" as const, nulls: "last" as const } },
          { receivedAt: "asc" as const },
        ]
      : [{ receivedAt: "asc" as const }];

  const activeLots = await tx.inventoryLot.findMany({
    where: {
      tenantId,
      variantId,
      warehouseId,
      quantityRemaining: { gt: 0 },
      isQuarantined: false,
    },
    orderBy,
  });

  const totalAvailable = activeLots.reduce(
    (sum, lot) => sum + lot.quantityRemaining,
    0,
  );
  if (totalAvailable < quantity) {
    throw new Error(
      `Insufficient lot stock for variant ${variantId} at warehouse ${warehouseId}: available=${totalAvailable}, requested=${quantity}`,
    );
  }

  let avcoUnitCost: string | null = null;
  if (costingMethod === "AVCO") {
    const totalCostTimesQty = activeLots.reduce(
      (sum, lot) => sum + Number(lot.unitCost) * lot.quantityRemaining,
      0,
    );
    avcoUnitCost = (totalCostTimesQty / totalAvailable).toFixed(4);
  }

  let remaining = quantity;
  const results: LotAdjustment[] = [];

  for (const lot of activeLots) {
    if (remaining <= 0) break;

    const depleteQty = Math.min(remaining, lot.quantityRemaining);
    const unitCostSnapshot =
      costingMethod === "AVCO"
        ? (avcoUnitCost as string)
        : String(lot.unitCost);

    const updatedLot = await tx.inventoryLot.update({
      where: { id: lot.id },
      data: { quantityRemaining: { decrement: depleteQty } },
    });

    const movement = await tx.stockMovement.create({
      data: {
        tenantId,
        type: "ADJUSTMENT",
        quantity: -depleteQty,
        unitCostSnapshot,
        costCurrency: lot.unitCostCurrency,
        referenceType: "MANUAL_ADJUSTMENT",
        notes: reason,
        performedBy,
        variantId,
        warehouseId,
        lotId: lot.id,
      },
    });

    results.push({ lot: updatedLot, movement, quantityAdjusted: -depleteQty });
    remaining -= depleteQty;
  }

  return results;
};

const addPositiveAdjustment = async (
  tx: TransactionClient,
  tenantId: string,
  variantId: string,
  warehouseId: string,
  quantity: number,
  performedBy: string,
  reason: string,
): Promise<LotAdjustment[]> => {
  const lot = await tx.inventoryLot.create({
    data: {
      tenantId,
      variantId,
      warehouseId,
      quantityReceived: quantity,
      quantityRemaining: quantity,
      unitCost: 0,
      unitCostCurrency: "PHP",
      receivedAt: new Date(),
      referenceType: "MANUAL_ADJUSTMENT",
      notes: reason,
    },
  });

  const movement = await tx.stockMovement.create({
    data: {
      tenantId,
      type: "ADJUSTMENT",
      quantity,
      unitCostSnapshot: 0,
      costCurrency: "PHP",
      referenceType: "MANUAL_ADJUSTMENT",
      notes: reason,
      performedBy,
      variantId,
      warehouseId,
      lotId: lot.id,
    },
  });

  return [{ lot, movement, quantityAdjusted: quantity }];
};

const checkLowStockAlert = async (
  tx: TransactionClient,
  tenantId: string,
  variantId: string,
  warehouseId: string,
  quantityAvailable: number,
  reorderPoint: number,
) => {
  if (reorderPoint <= 0 || quantityAvailable > reorderPoint) {
    return [];
  }

  const alertType =
    quantityAvailable <= 0 ? ("OUT_OF_STOCK" as const) : ("LOW_STOCK" as const);

  const existingAlert = await tx.stockAlert.findFirst({
    where: {
      tenantId,
      variantId,
      warehouseId,
      alertType,
      status: "OPEN",
    },
  });

  if (existingAlert) {
    return [];
  }

  const alert = await tx.stockAlert.create({
    data: {
      tenantId,
      variantId,
      warehouseId,
      alertType,
      status: "OPEN",
      threshold: reorderPoint,
      currentQty: quantityAvailable,
    },
  });

  return [alert];
};

const checkOverstockAlert = async (
  tx: TransactionClient,
  tenantId: string,
  variantId: string,
  warehouseId: string,
  currentQty: number,
  overstockThreshold: number,
) => {
  if (overstockThreshold <= 0 || currentQty < overstockThreshold) {
    return [];
  }

  const existingAlert = await tx.stockAlert.findFirst({
    where: {
      tenantId,
      variantId,
      warehouseId,
      alertType: "OVERSTOCK",
      status: "OPEN",
    },
  });

  if (existingAlert) {
    return [];
  }

  const alert = await tx.stockAlert.create({
    data: {
      tenantId,
      variantId,
      warehouseId,
      alertType: "OVERSTOCK",
      status: "OPEN",
      threshold: overstockThreshold,
      currentQty,
    },
  });

  return [alert];
};

export { manualAdjustment };
