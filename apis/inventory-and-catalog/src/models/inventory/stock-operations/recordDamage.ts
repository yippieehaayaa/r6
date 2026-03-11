import {
  InsufficientStockError,
  InventoryItemNotFoundError,
} from "../../../utils/errors";
import { prisma } from "../../../utils/prisma";

const recordDamage = async (
  variantId: string,
  warehouseId: string,
  qty: number,
  notes: string,
  performedBy: string,
) => {
  return await prisma.$transaction(async (tx) => {
    const item = await tx.inventoryItem.findUnique({
      where: { variantId_warehouseId: { variantId, warehouseId } },
    });

    if (!item) throw new InventoryItemNotFoundError();

    if (item.quantityOnHand < qty) throw new InsufficientStockError();

    const inventoryItem = await tx.inventoryItem.update({
      where: { variantId_warehouseId: { variantId, warehouseId } },
      data: { quantityOnHand: { decrement: qty } },
    });

    const movement = await tx.stockMovement.create({
      data: {
        type: "DAMAGE",
        quantity: -qty,
        notes,
        variantId,
        warehouseId,
        performedBy,
      },
    });

    return { inventoryItem, movement };
  });
};

export default recordDamage;
