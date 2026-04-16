import { prisma } from "../../client.js";
import type { TransactionClient } from "../_shared/audit.js";
import type {
  ReconcileLineResult,
  ReconcileStockCountInput,
  ReconcileStockCountResult,
  StockMovement,
} from "./types.js";

const reconcileStockCount = async (
  input: ReconcileStockCountInput,
): Promise<ReconcileStockCountResult> => {
  return prisma.$transaction(async (tx) => {
    const config = await tx.tenantInventoryConfig.findUnique({
      where: { tenantId: input.tenantId },
    });
    if (!config) {
      throw new Error(`Tenant ${input.tenantId} has not been onboarded`);
    }

    const stockCount = await tx.stockCount.findFirst({
      where: {
        id: input.stockCountId,
        tenantId: input.tenantId,
        deletedAt: null,
      },
      include: { items: true },
    });
    if (!stockCount) {
      throw new Error(`Stock count ${input.stockCountId} not found`);
    }
    if (stockCount.status !== "IN_PROGRESS") {
      throw new Error(
        `Stock count ${input.stockCountId} cannot be reconciled (status: ${stockCount.status})`,
      );
    }

    const varianceReasons = input.varianceReasons ?? {};
    for (const item of stockCount.items) {
      if (item.variance !== 0 && !varianceReasons[item.id]) {
        throw new Error(
          `varianceReason is required for stock count item ${item.id} (variance: ${item.variance})`,
        );
      }
    }

    const lines: ReconcileLineResult[] = [];

    for (const item of stockCount.items) {
      if (item.isReconciled) continue;

      const reason = varianceReasons[item.id] ?? "";
      let movements: StockMovement[] = [];

      if (item.variance !== 0) {
        if (item.lotId) {
          movements = await reconcileLotLevel(
            tx,
            input.tenantId,
            stockCount.id,
            stockCount.warehouseId,
            item.variantId,
            item.lotId,
            item.variance,
            input.performedBy,
            reason,
          );
        } else if (item.variance > 0) {
          movements = await reconcilePositiveVariantLevel(
            tx,
            input.tenantId,
            stockCount.id,
            stockCount.warehouseId,
            item.variantId,
            item.variance,
            config.defaultCurrency,
            input.performedBy,
            reason,
          );
        } else {
          movements = await reconcileNegativeVariantLevel(
            tx,
            input.tenantId,
            stockCount.id,
            stockCount.warehouseId,
            item.variantId,
            Math.abs(item.variance),
            config.costingMethod,
            input.performedBy,
            reason,
          );
        }

        await upsertInventoryItem(
          tx,
          input.tenantId,
          item.variantId,
          stockCount.warehouseId,
          item.variance,
        );
      }

      const updatedItem = await tx.stockCountItem.update({
        where: { id: item.id },
        data: {
          isReconciled: true,
          ...(reason && { varianceReason: reason }),
        },
      });

      const inventoryItem = await tx.inventoryItem.findUnique({
        where: {
          tenantId_variantId_warehouseId: {
            tenantId: input.tenantId,
            variantId: item.variantId,
            warehouseId: stockCount.warehouseId,
          },
        },
      });
      if (!inventoryItem) {
        throw new Error(
          `Inventory item not found for variant ${item.variantId} at warehouse ${stockCount.warehouseId}`,
        );
      }

      const alerts = await checkCountVarianceAlert(
        tx,
        input.tenantId,
        item.variantId,
        stockCount.warehouseId,
        item.variance,
        item.quantityExpected,
        Number(config.countVarianceThresholdPct),
      );

      lines.push({
        item: updatedItem,
        movements,
        inventoryItem,
        alerts,
      });
    }

    const updatedStockCount = await tx.stockCount.update({
      where: { id: stockCount.id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        supervisedBy: input.supervisedBy,
      },
    });

    return { stockCount: updatedStockCount, lines };
  });
};

const reconcileLotLevel = async (
  tx: TransactionClient,
  tenantId: string,
  stockCountId: string,
  warehouseId: string,
  variantId: string,
  lotId: string,
  variance: number,
  performedBy: string,
  reason: string,
): Promise<StockMovement[]> => {
  const lot = await tx.inventoryLot.findUnique({ where: { id: lotId } });
  if (!lot) {
    throw new Error(`Lot ${lotId} not found`);
  }

  if (variance < 0 && lot.quantityRemaining < Math.abs(variance)) {
    throw new Error(
      `Lot ${lotId} has insufficient remaining quantity (${lot.quantityRemaining}) for variance adjustment (${variance})`,
    );
  }

  await tx.inventoryLot.update({
    where: { id: lotId },
    data: { quantityRemaining: { increment: variance } },
  });

  const movement = await tx.stockMovement.create({
    data: {
      tenantId,
      type: "ADJUSTMENT",
      quantity: variance,
      unitCostSnapshot: lot.unitCost,
      costCurrency: lot.unitCostCurrency,
      referenceId: stockCountId,
      referenceType: "STOCK_COUNT",
      notes: reason,
      performedBy,
      variantId,
      warehouseId,
      lotId,
    },
  });

  return [movement];
};

const reconcilePositiveVariantLevel = async (
  tx: TransactionClient,
  tenantId: string,
  stockCountId: string,
  warehouseId: string,
  variantId: string,
  quantity: number,
  defaultCurrency: string,
  performedBy: string,
  reason: string,
): Promise<StockMovement[]> => {
  const lot = await tx.inventoryLot.create({
    data: {
      tenantId,
      variantId,
      warehouseId,
      quantityReceived: quantity,
      quantityRemaining: quantity,
      unitCost: 0,
      unitCostCurrency: defaultCurrency,
      receivedAt: new Date(),
      referenceId: stockCountId,
      referenceType: "STOCK_COUNT",
      notes: reason,
    },
  });

  const movement = await tx.stockMovement.create({
    data: {
      tenantId,
      type: "ADJUSTMENT",
      quantity,
      unitCostSnapshot: 0,
      costCurrency: defaultCurrency,
      referenceId: stockCountId,
      referenceType: "STOCK_COUNT",
      notes: reason,
      performedBy,
      variantId,
      warehouseId,
      lotId: lot.id,
    },
  });

  return [movement];
};

const reconcileNegativeVariantLevel = async (
  tx: TransactionClient,
  tenantId: string,
  stockCountId: string,
  warehouseId: string,
  variantId: string,
  quantity: number,
  costingMethod: string,
  performedBy: string,
  reason: string,
): Promise<StockMovement[]> => {
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

  let remaining = quantity;
  const movements: StockMovement[] = [];

  for (const lot of activeLots) {
    if (remaining <= 0) break;

    const depleteQty = Math.min(remaining, lot.quantityRemaining);

    await tx.inventoryLot.update({
      where: { id: lot.id },
      data: { quantityRemaining: { decrement: depleteQty } },
    });

    const movement = await tx.stockMovement.create({
      data: {
        tenantId,
        type: "ADJUSTMENT",
        quantity: -depleteQty,
        unitCostSnapshot: lot.unitCost,
        costCurrency: lot.unitCostCurrency,
        referenceId: stockCountId,
        referenceType: "STOCK_COUNT",
        notes: reason,
        performedBy,
        variantId,
        warehouseId,
        lotId: lot.id,
      },
    });

    movements.push(movement);
    remaining -= depleteQty;
  }

  return movements;
};

const upsertInventoryItem = async (
  tx: TransactionClient,
  tenantId: string,
  variantId: string,
  warehouseId: string,
  quantityDelta: number,
) => {
  const existing = await tx.inventoryItem.findUnique({
    where: {
      tenantId_variantId_warehouseId: { tenantId, variantId, warehouseId },
    },
  });

  if (existing) {
    return tx.inventoryItem.update({
      where: { id: existing.id },
      data: { quantityOnHand: { increment: quantityDelta } },
    });
  }

  return tx.inventoryItem.create({
    data: {
      tenantId,
      variantId,
      warehouseId,
      quantityOnHand: quantityDelta,
    },
  });
};

const checkCountVarianceAlert = async (
  tx: TransactionClient,
  tenantId: string,
  variantId: string,
  warehouseId: string,
  variance: number,
  quantityExpected: number,
  thresholdPct: number,
) => {
  if (variance === 0) return [];

  const exceedsThreshold =
    quantityExpected === 0
      ? true
      : (Math.abs(variance) / quantityExpected) * 100 > thresholdPct;

  if (!exceedsThreshold) return [];

  const existingAlert = await tx.stockAlert.findFirst({
    where: {
      tenantId,
      variantId,
      warehouseId,
      alertType: "COUNT_VARIANCE",
      status: "OPEN",
    },
  });

  if (existingAlert) return [];

  const alert = await tx.stockAlert.create({
    data: {
      tenantId,
      variantId,
      warehouseId,
      alertType: "COUNT_VARIANCE",
      status: "OPEN",
      threshold: quantityExpected,
      currentQty: quantityExpected + variance,
    },
  });

  return [alert];
};

export { reconcileStockCount };
