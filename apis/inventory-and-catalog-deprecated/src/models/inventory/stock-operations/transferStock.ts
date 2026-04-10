import {
  InsufficientStockError,
  InventoryItemNotFoundError,
} from "../../../utils/errors";
import { prisma } from "../../../utils/prisma";

const transferStock = async (
  tenantSlug: string,
  variantId: string,
  fromWarehouseId: string,
  toWarehouseId: string,
  qty: number,
  performedBy: string,
) => {
  return await prisma.$transaction(async (tx) => {
    const source = await tx.inventoryItem.findUnique({
      where: {
        tenantSlug_variantId_warehouseId: {
          tenantSlug,
          variantId,
          warehouseId: fromWarehouseId,
        },
      },
    });

    if (!source) throw new InventoryItemNotFoundError();
    if (source.quantityOnHand < qty) throw new InsufficientStockError();

    const destination = await tx.inventoryItem.findUnique({
      where: {
        tenantSlug_variantId_warehouseId: {
          tenantSlug,
          variantId,
          warehouseId: toWarehouseId,
        },
      },
    });

    if (!destination) throw new InventoryItemNotFoundError();

    const [updatedSource, transferOut, updatedDestination, transferIn] =
      await Promise.all([
        tx.inventoryItem.update({
          where: {
            tenantSlug_variantId_warehouseId: {
              tenantSlug,
              variantId,
              warehouseId: fromWarehouseId,
            },
          },
          data: { quantityOnHand: { decrement: qty } },
        }),
        tx.stockMovement.create({
          data: {
            tenantSlug,
            type: "TRANSFER_OUT",
            quantity: -qty,
            variantId,
            warehouseId: fromWarehouseId,
            performedBy,
          },
        }),
        tx.inventoryItem.update({
          where: {
            tenantSlug_variantId_warehouseId: {
              tenantSlug,
              variantId,
              warehouseId: toWarehouseId,
            },
          },
          data: { quantityOnHand: { increment: qty } },
        }),
        tx.stockMovement.create({
          data: {
            tenantSlug,
            type: "TRANSFER_IN",
            quantity: qty,
            variantId,
            warehouseId: toWarehouseId,
            performedBy,
          },
        }),
      ]);

    return {
      source: updatedSource,
      destination: updatedDestination,
      movements: [transferOut, transferIn],
    };
  });
};

export default transferStock;
