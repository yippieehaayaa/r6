import { toMajorUnits } from "../../../utils/currency";
import { prisma } from "../../../utils/prisma";
import type { DateRange } from "./types";

const getBrandRevenue = async (brandId: string, dateRange?: DateRange) => {
  const variants = await prisma.productVariant.findMany({
    where: {
      product: { brandId, deletedAt: { isSet: false } },
      deletedAt: { isSet: false },
    },
    select: { id: true, price: true },
  });

  if (variants.length === 0) return { brandId, revenue: 0 };

  const priceMap = new Map(variants.map((v) => [v.id, v.price]));
  const variantIds = variants.map((v) => v.id);

  const movements = await prisma.stockMovement.findMany({
    where: {
      variantId: { in: variantIds },
      type: "SALE",
      ...(dateRange && {
        createdAt: { gte: dateRange.from, lte: dateRange.to },
      }),
    },
    select: { quantity: true, variantId: true },
  });

  const revenue = movements.reduce((acc, m) => {
    const price = priceMap.get(m.variantId) ?? 0;
    return acc + Math.abs(m.quantity) * price;
  }, 0);

  return { brandId, revenue: toMajorUnits(revenue) };
};

export default getBrandRevenue;
