import { InventoryItemNotFoundError } from "../../../utils/errors";
import { prisma } from "../../../utils/prisma";

const getStockForVariant = async (
  tenantSlug: string,
  variantId: string,
  warehouseId: string,
) => {
  const item = await prisma.inventoryItem.findUnique({
    where: {
      tenantSlug_variantId_warehouseId: { tenantSlug, variantId, warehouseId },
    },
  });

  if (!item) throw new InventoryItemNotFoundError();

  return item;
};

export default getStockForVariant;
