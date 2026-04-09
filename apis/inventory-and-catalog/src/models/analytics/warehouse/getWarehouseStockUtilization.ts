import { prisma } from "../../../utils/prisma";

const getWarehouseStockUtilization = async (
  tenantSlug: string,
  warehouseId: string,
) => {
  const inventoryItems = await prisma.inventoryItem.findMany({
    where: {
      tenantSlug,
      warehouseId,
      variant: { deletedAt: { isSet: false } },
    },
    select: {
      variantId: true,
      quantityOnHand: true,
      quantityReserved: true,
      variant: { select: { sku: true, name: true } },
    },
  });

  let totalOnHand = 0;
  let totalReserved = 0;

  const items = inventoryItems.map((item) => {
    const utilizationRate =
      item.quantityOnHand > 0 ? item.quantityReserved / item.quantityOnHand : 0;

    totalOnHand += item.quantityOnHand;
    totalReserved += item.quantityReserved;

    return {
      variantId: item.variantId,
      variantSku: item.variant.sku,
      variantName: item.variant.name,
      quantityOnHand: item.quantityOnHand,
      quantityReserved: item.quantityReserved,
      utilizationRate,
    };
  });

  const overallUtilizationRate =
    totalOnHand > 0 ? totalReserved / totalOnHand : 0;

  return {
    warehouseId,
    items,
    summary: {
      totalOnHand,
      totalReserved,
      overallUtilizationRate,
    },
  };
};

export default getWarehouseStockUtilization;
