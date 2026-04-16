import { prisma } from "../../../utils/prisma";

const getOutOfStockItems = async (tenantSlug: string, warehouseId?: string) => {
  const items = await prisma.inventoryItem.findMany({
    where: {
      tenantSlug,
      quantityOnHand: 0,
      ...(warehouseId && { warehouseId }),
    },
    include: { variant: true, warehouse: true },
  });

  return items.map(({ variant, warehouse, ...rest }) => ({
    ...rest,
    variantName: variant.name,
    sku: variant.sku,
    warehouseName: warehouse.name,
  }));
};

export default getOutOfStockItems;
