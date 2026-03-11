import { prisma } from "../../../utils/prisma";

const getLowStockItems = async (warehouseId?: string) => {
  const items = await prisma.inventoryItem.findMany({
    where: { ...(warehouseId !== undefined && { warehouseId }) },
    include: { variant: true, warehouse: true },
  });

  return items.filter((i) => i.quantityOnHand <= i.reorderPoint);
};

export default getLowStockItems;
