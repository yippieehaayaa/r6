import { prisma } from "../../../utils/prisma";

const updateReorderPoint = async (
  tenantSlug: string,
  variantId: string,
  warehouseId: string,
  reorderPoint: number,
) => {
  const item = await prisma.inventoryItem.updateMany({
    where: { tenantSlug, variantId, warehouseId },
    data: { reorderPoint },
  });

  if (item.count === 0) {
    throw new Error(
      `InventoryItem not found for variantId=${variantId} warehouseId=${warehouseId}`,
    );
  }

  return prisma.inventoryItem.findFirstOrThrow({
    where: { tenantSlug, variantId, warehouseId },
  });
};

export default updateReorderPoint;
