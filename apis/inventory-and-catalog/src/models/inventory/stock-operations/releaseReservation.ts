import {
  InvalidReservationError,
  InventoryItemNotFoundError,
} from "../../../utils/errors";
import { prisma } from "../../../utils/prisma";

const releaseReservation = async (
  variantId: string,
  warehouseId: string,
  qty: number,
  performedBy: string,
) => {
  return await prisma.$transaction(async (tx) => {
    const item = await tx.inventoryItem.findUnique({
      where: { variantId_warehouseId: { variantId, warehouseId } },
    });

    if (!item) throw new InventoryItemNotFoundError();

    if (item.quantityReserved < qty) {
      throw new InvalidReservationError();
    }

    const inventoryItem = await tx.inventoryItem.update({
      where: { variantId_warehouseId: { variantId, warehouseId } },
      data: { quantityReserved: { decrement: qty } },
    });

    const movement = await tx.stockMovement.create({
      data: {
        type: "RESERVATION_RELEASE",
        quantity: -qty,
        variantId,
        warehouseId,
        performedBy,
      },
    });

    return { inventoryItem, movement };
  });
};

export default releaseReservation;
