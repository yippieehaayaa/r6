import { prisma } from "../../../utils/prisma";

const getBrandStockHealth = async (brandId: string) => {
  const variants = await prisma.productVariant.findMany({
    where: {
      product: { brandId, deletedAt: { isSet: false } },
      deletedAt: { isSet: false },
    },
    select: {
      id: true,
      sku: true,
      name: true,
      product: { select: { id: true, sku: true, name: true } },
    },
  });

  const emptySummary = {
    totalOnHand: 0,
    totalReserved: 0,
    totalAvailable: 0,
    belowReorderPoint: 0,
  };

  if (variants.length === 0) {
    return { brandId, items: [], summary: emptySummary };
  }

  const variantIds = variants.map((v) => v.id);
  const variantInfoMap = new Map(variants.map((v) => [v.id, v]));

  const inventoryItems = await prisma.inventoryItem.findMany({
    where: { variantId: { in: variantIds } },
    select: {
      variantId: true,
      quantityOnHand: true,
      quantityReserved: true,
      reorderPoint: true,
      warehouseId: true,
      warehouse: { select: { name: true, code: true } },
    },
  });

  let totalOnHand = 0;
  let totalReserved = 0;
  let belowReorderPoint = 0;

  const items = inventoryItems.map((item) => {
    const variantInfo = variantInfoMap.get(item.variantId);
    const quantityAvailable = item.quantityOnHand - item.quantityReserved;
    const isBelowReorderPoint = item.quantityOnHand <= item.reorderPoint;

    totalOnHand += item.quantityOnHand;
    totalReserved += item.quantityReserved;
    if (isBelowReorderPoint) belowReorderPoint++;

    return {
      variantId: item.variantId,
      variantSku: variantInfo?.sku,
      variantName: variantInfo?.name,
      productId: variantInfo?.product.id,
      productSku: variantInfo?.product.sku,
      productName: variantInfo?.product.name,
      warehouseId: item.warehouseId,
      warehouseName: item.warehouse.name,
      warehouseCode: item.warehouse.code,
      quantityOnHand: item.quantityOnHand,
      quantityReserved: item.quantityReserved,
      quantityAvailable,
      reorderPoint: item.reorderPoint,
      isBelowReorderPoint,
    };
  });

  return {
    brandId,
    items,
    summary: {
      totalOnHand,
      totalReserved,
      totalAvailable: totalOnHand - totalReserved,
      belowReorderPoint,
    },
  };
};

export default getBrandStockHealth;
