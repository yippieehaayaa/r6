import { prisma } from "../../../utils/prisma";
import type { DateRange } from "./types";

const getProductStockTurnover = async (
  productId: string,
  period: DateRange,
) => {
  const variants = await prisma.productVariant.findMany({
    where: {
      product: { id: productId, deletedAt: { isSet: false } },
      deletedAt: { isSet: false },
    },
    select: { id: true },
  });

  if (variants.length === 0) {
    return {
      productId,
      period,
      totalUnitsSold: 0,
      avgOnHand: 0,
      turnoverRate: null,
    };
  }

  const variantIds = variants.map((v) => v.id);

  const [salesResult, inventoryItems] = await Promise.all([
    prisma.stockMovement.aggregate({
      where: {
        variantId: { in: variantIds },
        type: "SALE",
        createdAt: { gte: period.from, lte: period.to },
      },
      _sum: { quantity: true },
    }),
    prisma.inventoryItem.findMany({
      where: { variantId: { in: variantIds } },
      select: { quantityOnHand: true },
    }),
  ]);

  const totalUnitsSold = Math.abs(salesResult._sum.quantity ?? 0);
  const totalOnHand = inventoryItems.reduce(
    (acc, i) => acc + i.quantityOnHand,
    0,
  );
  const avgOnHand =
    inventoryItems.length > 0 ? totalOnHand / inventoryItems.length : 0;
  const turnoverRate = avgOnHand > 0 ? totalUnitsSold / avgOnHand : null;

  return { productId, period, totalUnitsSold, avgOnHand, turnoverRate };
};

export default getProductStockTurnover;
