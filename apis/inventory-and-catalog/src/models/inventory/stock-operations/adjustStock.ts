import { InventoryItemNotFoundError } from "../../../utils/errors";
import { prisma } from "../../../utils/prisma";

const adjustStock = async (
  tenantSlug: string,
  variantId: string,
  warehouseId: string,
  delta: number,
  notes: string,
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

    const inventoryItem = await tx.inventoryItem.update({
      where: {
        tenantSlug_variantId_warehouseId: {
          tenantSlug,
          variantId,
          warehouseId,
        },
      },
      data: { quantityOnHand: { increment: delta } },
    });

    const movement = await tx.stockMovement.create({
      data: {
        tenantSlug,
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
