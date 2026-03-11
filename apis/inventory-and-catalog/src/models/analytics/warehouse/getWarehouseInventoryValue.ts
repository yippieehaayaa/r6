import { prisma } from "../../../utils/prisma";

const getWarehouseInventoryValue = async (warehouseId: string) => {
  const items = await prisma.inventoryItem.findMany({
    where: {
      warehouseId,
      variant: { deletedAt: { isSet: false } },
    },
    select: {
      quantityOnHand: true,
      variant: { select: { price: true } },
    },
  });

  const totalValue = items.reduce(
    (acc, item) => acc + item.quantityOnHand * item.variant.price,
    0,
  );

  return { warehouseId, totalValue, itemCount: items.length };
};

export default getWarehouseInventoryValue;
