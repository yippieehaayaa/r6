import { InventoryItemNotFoundError } from "../../../utils/errors";
import { prisma } from "../../../utils/prisma";

const getStockForVariant = async (variantId: string, warehouseId: string) => {
  const item = await prisma.inventoryItem.findUnique({
    where: { variantId_warehouseId: { variantId, warehouseId } },
  });

  if (!item) throw new InventoryItemNotFoundError();

  return item;
};

export default getStockForVariant;
