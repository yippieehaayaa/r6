import { toMajorUnits } from "../../../utils/currency";
import { prisma } from "../../../utils/prisma";

const getDeadStockReport = async (tenantSlug: string, threshold = 90) => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - threshold);

  const recentMovements = await prisma.stockMovement.findMany({
    where: {
      tenantSlug,
      type: "SALE",
      createdAt: { gte: cutoff },
    },
    select: { variantId: true },
  });

  const activeVariantIds = new Set(recentMovements.map((m) => m.variantId));

  const inventoryItems = await prisma.inventoryItem.findMany({
    where: {
      tenantSlug,
      quantityOnHand: { gt: 0 },
      variant: { deletedAt: { isSet: false } },
    },
    select: {
      variantId: true,
      warehouseId: true,
      quantityOnHand: true,
      variant: {
        select: {
          sku: true,
          name: true,
          price: true,
          product: { select: { id: true, sku: true, name: true } },
        },
      },
    },
  });

  const items = inventoryItems
    .filter((item) => !activeVariantIds.has(item.variantId))
    .map((item) => ({
      variantId: item.variantId,
      variantSku: item.variant.sku,
      variantName: item.variant.name,
      productId: item.variant.product.id,
      productSku: item.variant.product.sku,
      productName: item.variant.product.name,
      warehouseId: item.warehouseId,
      quantityOnHand: item.quantityOnHand,
      totalValue: toMajorUnits(item.quantityOnHand * item.variant.price),
    }));

  return {
    thresholdDays: threshold,
    reportedAt: new Date(),
    totalVariants: items.length,
    items,
  };
};

export default getDeadStockReport;
