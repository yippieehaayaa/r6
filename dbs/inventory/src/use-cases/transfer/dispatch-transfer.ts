import { prisma } from "../../client.js";
import type { TransactionClient } from "../_shared/audit.js";
import type {
  DispatchTransferInput,
  DispatchTransferLineResult,
  DispatchTransferResult,
  LotShipment,
} from "./types.js";

const dispatchTransfer = async (
  input: DispatchTransferInput,
): Promise<DispatchTransferResult> => {
  if (!input.lines.length) {
    throw new Error("At least one line item is required");
  }

  if (input.fromWarehouseId === input.toWarehouseId) {
    throw new Error("Source and destination warehouses must be different");
  }

  return prisma.$transaction(async (tx) => {
    const config = await tx.tenantInventoryConfig.findUnique({
      where: { tenantId: input.tenantId },
    });
    if (!config) {
      throw new Error(`Tenant ${input.tenantId} has not been onboarded`);
    }

    const variantIds = [...new Set(input.lines.map((l) => l.variantId))];

    const [variants, fromWarehouse, toWarehouse] = await Promise.all([
      tx.productVariant.findMany({
        where: {
          id: { in: variantIds },
          tenantId: input.tenantId,
          deletedAt: null,
        },
      }),
      tx.warehouse.findFirst({
        where: {
          id: input.fromWarehouseId,
          tenantId: input.tenantId,
          isActive: true,
          deletedAt: null,
        },
      }),
      tx.warehouse.findFirst({
        where: {
          id: input.toWarehouseId,
          tenantId: input.tenantId,
          isActive: true,
          deletedAt: null,
        },
      }),
    ]);

    if (!fromWarehouse) {
      throw new Error(
        `Source warehouse ${input.fromWarehouseId} not found, inactive, or deleted`,
      );
    }
    if (!toWarehouse) {
      throw new Error(
        `Destination warehouse ${input.toWarehouseId} not found, inactive, or deleted`,
      );
    }

    const variantMap = new Map(variants.map((v) => [v.id, v]));
    for (const line of input.lines) {
      if (!variantMap.has(line.variantId)) {
        throw new Error(`Variant ${line.variantId} not found or deleted`);
      }
      if (line.quantity <= 0) {
        throw new Error(
          `quantity must be positive for variant ${line.variantId}`,
        );
      }
    }

    const transfer = await tx.stockTransfer.create({
      data: {
        tenantId: input.tenantId,
        status: "IN_TRANSIT",
        fromWarehouseId: input.fromWarehouseId,
        toWarehouseId: input.toWarehouseId,
        performedBy: input.performedBy,
        dispatchedAt: new Date(),
        ...(input.expectedAt && { expectedAt: input.expectedAt }),
        ...(input.notes && { notes: input.notes }),
      },
    });

    const results: DispatchTransferLineResult[] = [];

    for (const line of input.lines) {
      const lotShipments = await depleteLots(
        tx,
        input.tenantId,
        transfer.id,
        line.variantId,
        input.fromWarehouseId,
        line.quantity,
        config.costingMethod,
        input.performedBy,
      );

      const inventoryItem = await tx.inventoryItem.update({
        where: {
          tenantId_variantId_warehouseId: {
            tenantId: input.tenantId,
            variantId: line.variantId,
            warehouseId: input.fromWarehouseId,
          },
        },
        data: { quantityOnHand: { decrement: line.quantity } },
      });

      const quantityAvailable =
        inventoryItem.quantityOnHand - inventoryItem.quantityReserved;
      const alerts = await checkLowStockAlert(
        tx,
        input.tenantId,
        line.variantId,
        input.fromWarehouseId,
        quantityAvailable,
        inventoryItem.reorderPoint,
      );

      results.push({ lotShipments, inventoryItem, alerts });
    }

    return { transfer, lines: results };
  });
};

const depleteLots = async (
  tx: TransactionClient,
  tenantId: string,
  transferId: string,
  variantId: string,
  warehouseId: string,
  quantity: number,
  costingMethod: string,
  performedBy: string,
): Promise<LotShipment[]> => {
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
  const results: LotShipment[] = [];

  for (const lot of activeLots) {
    if (remaining <= 0) break;

    const shipQty = Math.min(remaining, lot.quantityRemaining);

    const updatedLot = await tx.inventoryLot.update({
      where: { id: lot.id },
      data: { quantityRemaining: { decrement: shipQty } },
    });

    const movement = await tx.stockMovement.create({
      data: {
        tenantId,
        type: "TRANSFER_OUT",
        quantity: -shipQty,
        unitCostSnapshot: lot.unitCost,
        costCurrency: lot.unitCostCurrency,
        referenceId: transferId,
        referenceType: "STOCK_TRANSFER",
        performedBy,
        variantId,
        warehouseId,
        lotId: lot.id,
      },
    });

    const transferItem = await tx.stockTransferItem.create({
      data: {
        tenantId,
        transferId,
        variantId,
        lotId: lot.id,
        quantityRequested: shipQty,
        quantityShipped: shipQty,
      },
    });

    results.push({
      lot: updatedLot,
      movement,
      transferItem,
      quantityShipped: shipQty,
    });
    remaining -= shipQty;
  }

  return results;
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

  if (existingAlert) return [];

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

export { dispatchTransfer };
