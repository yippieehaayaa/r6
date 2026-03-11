import { prisma } from "../../../utils/prisma";

const getWarehouseLowStockByBrand = async (
  warehouseId: string,
  brandId: string,
) => {
  const inventoryItems = await prisma.inventoryItem.findMany({
    where: {
      warehouseId,
      variant: {
        deletedAt: { isSet: false },
        product: { brandId, deletedAt: { isSet: false } },
      },
    },
    select: {
      variantId: true,
      quantityOnHand: true,
      quantityReserved: true,
      reorderPoint: true,
      variant: {
        select: {
          sku: true,
          name: true,
          product: { select: { id: true, sku: true, name: true } },
        },
      },
    },
  });

  const items = inventoryItems
    .filter((item) => item.quantityOnHand <= item.reorderPoint)
    .map((item) => ({
      variantId: item.variantId,
      variantSku: item.variant.sku,
      variantName: item.variant.name,
      productId: item.variant.product.id,
      productSku: item.variant.product.sku,
      productName: item.variant.product.name,
      quantityOnHand: item.quantityOnHand,
      quantityReserved: item.quantityReserved,
      reorderPoint: item.reorderPoint,
      shortfall: item.reorderPoint - item.quantityOnHand,
    }));

  return { warehouseId, brandId, items, totalLowStock: items.length };
};

export default getWarehouseLowStockByBrand;
