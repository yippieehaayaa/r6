import {
  InsufficientStockError,
  InvalidReservationError,
  InventoryItemNotFoundError,
} from "../../../utils/errors";
import { prisma } from "../../../utils/prisma";

const commitSale = async (
  tenantSlug: string,
  variantId: string,
  warehouseId: string,
  qty: number,
  referenceId: string,
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

    if (item.quantityOnHand < qty) throw new InsufficientStockError();
    if (item.quantityReserved < qty) throw new InvalidReservationError();

    const inventoryItem = await tx.inventoryItem.update({
      where: {
        tenantSlug_variantId_warehouseId: {
          tenantSlug,
          variantId,
          warehouseId,
        },
      },
      data: {
        quantityOnHand: { decrement: qty },
        quantityReserved: { decrement: qty },
      },
    });

    const movement = await tx.stockMovement.create({
      data: {
        tenantSlug,
        type: "SALE",
        quantity: -qty,
        referenceId,
        referenceType: "SALE_ORDER",
        variantId,
        warehouseId,
        performedBy,
      },
    });

    return { inventoryItem, movement };
  });
};

export default commitSale;
