import { prisma } from "../../client.js";
import type { TransactionClient } from "../_shared/audit.js";
import type {
  ReceiveTransferInput,
  ReceiveTransferLineResult,
  ReceiveTransferResult,
} from "./types.js";

const receiveTransfer = async (
  input: ReceiveTransferInput,
): Promise<ReceiveTransferResult> => {
  if (!input.lines.length) {
    throw new Error("At least one line item is required");
  }

  return prisma.$transaction(async (tx) => {
    const config = await tx.tenantInventoryConfig.findUnique({
      where: { tenantId: input.tenantId },
    });
    if (!config) {
      throw new Error(`Tenant ${input.tenantId} has not been onboarded`);
    }

    const transfer = await tx.stockTransfer.findFirst({
      where: {
        id: input.transferId,
        tenantId: input.tenantId,
        deletedAt: null,
      },
      include: { items: true },
    });

    if (!transfer) {
      throw new Error(`Transfer ${input.transferId} not found`);
    }
    if (
      transfer.status !== "IN_TRANSIT" &&
      transfer.status !== "PARTIALLY_RECEIVED"
    ) {
      throw new Error(
        `Transfer ${input.transferId} cannot be received (status: ${transfer.status})`,
      );
    }

    const itemMap = new Map(transfer.items.map((i) => [i.id, i]));
    for (const line of input.lines) {
      const item = itemMap.get(line.transferItemId);
      if (!item) {
        throw new Error(
          `Transfer item ${line.transferItemId} not found on transfer ${input.transferId}`,
        );
      }
      if (line.quantityReceived <= 0) {
        throw new Error(
          `quantityReceived must be positive for transfer item ${line.transferItemId}`,
        );
      }
      const maxReceivable = item.quantityShipped - item.quantityReceived;
      if (line.quantityReceived > maxReceivable) {
        throw new Error(
          `quantityReceived (${line.quantityReceived}) exceeds remaining receivable quantity (${maxReceivable}) for transfer item ${line.transferItemId}`,
        );
      }
    }

    const results: ReceiveTransferLineResult[] = [];

    for (const line of input.lines) {
      const item = itemMap.get(line.transferItemId);
      if (!item) {
        throw new Error(
          `Transfer item ${line.transferItemId} not found on transfer ${input.transferId}`,
        );
      }

      const sourceLot = await tx.inventoryLot.findUnique({
        where: { id: item.lotId },
      });
      if (!sourceLot) {
        throw new Error(`Source lot ${item.lotId} not found`);
      }

      const newLot = await tx.inventoryLot.create({
        data: {
          tenantId: input.tenantId,
          variantId: item.variantId,
          warehouseId: transfer.toWarehouseId,
          quantityReceived: line.quantityReceived,
          quantityRemaining: line.quantityReceived,
          unitCost: sourceLot.unitCost,
          unitCostCurrency: sourceLot.unitCostCurrency,
          receivedAt: new Date(),
          referenceId: transfer.id,
          referenceType: "STOCK_TRANSFER",
          ...(sourceLot.lotNumber && { lotNumber: sourceLot.lotNumber }),
          ...(sourceLot.expiresAt && { expiresAt: sourceLot.expiresAt }),
          ...(sourceLot.manufacturedAt && {
            manufacturedAt: sourceLot.manufacturedAt,
          }),
        },
      });

      const movement = await tx.stockMovement.create({
        data: {
          tenantId: input.tenantId,
          type: "TRANSFER_IN",
          quantity: line.quantityReceived,
          unitCostSnapshot: sourceLot.unitCost,
          costCurrency: sourceLot.unitCostCurrency,
          referenceId: transfer.id,
          referenceType: "STOCK_TRANSFER",
          performedBy: input.performedBy,
          variantId: item.variantId,
          warehouseId: transfer.toWarehouseId,
          lotId: newLot.id,
        },
      });

      const transferItem = await tx.stockTransferItem.update({
        where: { id: item.id },
        data: { quantityReceived: { increment: line.quantityReceived } },
      });

      const inventoryItem = await upsertInventoryItem(
        tx,
        input.tenantId,
        item.variantId,
        transfer.toWarehouseId,
        line.quantityReceived,
      );

      const alerts = await checkOverstockAlert(
        tx,
        input.tenantId,
        item.variantId,
        transfer.toWarehouseId,
        inventoryItem.quantityOnHand,
        inventoryItem.overstockThreshold,
      );

      results.push({
        transferItem,
        lot: newLot,
        movement,
        inventoryItem,
        alerts,
      });
    }

    const updatedItems = await tx.stockTransferItem.findMany({
      where: { transferId: transfer.id },
    });

    const allFullyReceived = updatedItems.every(
      (i) => i.quantityReceived >= i.quantityShipped,
    );
    const newStatus = allFullyReceived ? "COMPLETED" : "PARTIALLY_RECEIVED";

    const updatedTransfer = await tx.stockTransfer.update({
      where: { id: transfer.id },
      data: {
        status: newStatus,
        ...(newStatus === "COMPLETED" && { completedAt: new Date() }),
      },
    });

    return { transfer: updatedTransfer, lines: results };
  });
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

  if (existingAlert) return [];

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

export { receiveTransfer };
