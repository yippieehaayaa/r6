import {
  InsufficientStockError,
  InventoryItemNotFoundError,
} from "../../../utils/errors";
import { prisma } from "../../../utils/prisma";

const reserveStock = async (
  tenantSlug: string,
  variantId: string,
  warehouseId: string,
  qty: number,
  performedBy: string,
) => {
  return await prisma.$transaction(async (tx) => {
    const item = await tx.inventoryItem.findUnique({
      where: {
        tenantSlug_variantId_warehouseId: {
          tenantSlug,
          variantId,
          warehouseId,
        },
      },
    });

    if (!item) throw new InventoryItemNotFoundError();

    if (item.quantityOnHand - item.quantityReserved < qty) {
      throw new InsufficientStockError();
    }

    const inventoryItem = await tx.inventoryItem.update({
      where: {
        tenantSlug_variantId_warehouseId: {
          tenantSlug,
          variantId,
          warehouseId,
        },
      },
      data: { quantityReserved: { increment: qty } },
    });

    const movement = await tx.stockMovement.create({
      data: {
        tenantSlug,
        type: "RESERVATION",
        quantity: qty,
        variantId,
        warehouseId,
        performedBy,
      },
    });

    return { inventoryItem, movement };
  });
};

export default reserveStock;
