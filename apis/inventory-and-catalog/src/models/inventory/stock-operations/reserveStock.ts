import {
  InsufficientStockError,
  InventoryItemNotFoundError,
} from "../../../utils/errors";
import { prisma } from "../../../utils/prisma";

const reserveStock = async (
  variantId: string,
  warehouseId: string,
  qty: number,
) => {
  return await prisma.$transaction(async (tx) => {
    const item = await tx.inventoryItem.findUnique({
      where: { variantId_warehouseId: { variantId, warehouseId } },
    });

    if (!item) throw new InventoryItemNotFoundError();

    if (item.quantityOnHand - item.quantityReserved < qty) {
      throw new InsufficientStockError();
    }

    return await tx.inventoryItem.update({
      where: { variantId_warehouseId: { variantId, warehouseId } },
      data: { quantityReserved: { increment: qty } },
    });
  });
};

export default reserveStock;
