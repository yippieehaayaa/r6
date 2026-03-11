import { InventoryItemNotFoundError } from "../../../utils/errors";
import { prisma } from "../../../utils/prisma";

const adjustStock = async (
  variantId: string,
  warehouseId: string,
  delta: number,
  notes: string,
  performedBy: string,
) => {
  return await prisma.$transaction(async (tx) => {
    const item = await tx.inventoryItem.findUnique({
      where: { variantId_warehouseId: { variantId, warehouseId } },
    });

    if (!item) throw new InventoryItemNotFoundError();

    const inventoryItem = await tx.inventoryItem.update({
      where: { variantId_warehouseId: { variantId, warehouseId } },
      data: { quantityOnHand: { increment: delta } },
    });

    const movement = await tx.stockMovement.create({
      data: {
        type: "ADJUSTMENT",
        quantity: delta,
        notes,
        variantId,
        warehouseId,
        performedBy,
      },
    });

    return { inventoryItem, movement };
  });
};

export default adjustStock;
