import { prisma } from "../../client.js";
import type {
  CancelTransferInput,
  CancelTransferLineResult,
  CancelTransferResult,
} from "./types.js";

const cancelTransfer = async (
  input: CancelTransferInput,
): Promise<CancelTransferResult> => {
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
    if (transfer.status === "CANCELLED") {
      throw new Error(`Transfer ${input.transferId} is already cancelled`);
    }
    if (transfer.status === "COMPLETED") {
      throw new Error(
        `Transfer ${input.transferId} cannot be cancelled (status: COMPLETED)`,
      );
    }

    if (transfer.status === "DRAFT") {
      const updated = await tx.stockTransfer.update({
        where: { id: transfer.id },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
        },
      });
      return { transfer: updated, lines: [] };
    }

    const lines: CancelTransferLineResult[] = [];

    for (const item of transfer.items) {
      const unreceived = item.quantityShipped - item.quantityReceived;
      if (unreceived <= 0) {
        continue;
      }

      const lot = await tx.inventoryLot.findFirst({
        where: {
          id: item.lotId,
          tenantId: input.tenantId,
          warehouseId: transfer.fromWarehouseId,
          deletedAt: null,
        },
      });
      if (!lot) {
        throw new Error(
          `Source lot ${item.lotId} not found for transfer item ${item.id}`,
        );
      }

      const updatedLot = await tx.inventoryLot.update({
        where: { id: item.lotId },
        data: { quantityRemaining: { increment: unreceived } },
      });

      const movement = await tx.stockMovement.create({
        data: {
          tenantId: input.tenantId,
          type: "TRANSFER_IN",
          quantity: unreceived,
          unitCostSnapshot: lot.unitCost,
          costCurrency: lot.unitCostCurrency,
          referenceId: transfer.id,
          referenceType: "STOCK_TRANSFER",
          performedBy: input.performedBy,
          variantId: item.variantId,
          warehouseId: transfer.fromWarehouseId,
          lotId: item.lotId,
        },
      });

      const inventoryItem = await tx.inventoryItem.update({
        where: {
          tenantId_variantId_warehouseId: {
            tenantId: input.tenantId,
            variantId: item.variantId,
            warehouseId: transfer.fromWarehouseId,
          },
        },
        data: { quantityOnHand: { increment: unreceived } },
      });

      lines.push({
        transferItem: item,
        lot: updatedLot,
        movement,
        inventoryItem,
      });
    }

    const updatedTransfer = await tx.stockTransfer.update({
      where: { id: transfer.id },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
      },
    });

    return { transfer: updatedTransfer, lines };
  });
};

export { cancelTransfer };
