import { prisma } from "../../../utils/prisma";
import type { DateRange } from "./types";

const getProductReturnRate = async (
  tenantSlug: string,
  productId: string,
  dateRange?: DateRange,
) => {
  const variants = await prisma.productVariant.findMany({
    where: {
      tenantSlug,
      product: { id: productId, deletedAt: { isSet: false } },
      deletedAt: { isSet: false },
    },
    select: { id: true },
  });

  if (variants.length === 0) {
    return { productId, totalSales: 0, totalReturns: 0, returnRate: null };
  }

  const variantIds = variants.map((v) => v.id);

  const movements = await prisma.stockMovement.findMany({
    where: {
      tenantSlug,
      variantId: { in: variantIds },
      type: { in: ["SALE", "RETURN"] },
      ...(dateRange && {
        createdAt: { gte: dateRange.from, lte: dateRange.to },
      }),
    },
    select: { quantity: true, type: true },
  });

  let totalSales = 0;
  let totalReturns = 0;

  for (const m of movements) {
    if (m.type === "SALE") totalSales += Math.abs(m.quantity);
    else totalReturns += Math.abs(m.quantity);
  }

  const returnRate = totalSales > 0 ? totalReturns / totalSales : null;

  return { productId, totalSales, totalReturns, returnRate };
};

export default getProductReturnRate;
