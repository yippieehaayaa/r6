import { prisma } from "../../../utils/prisma";
import type { DateRange } from "./types";

const getTotalSoldByProduct = async (
  productId: string,
  dateRange?: DateRange,
) => {
  const variants = await prisma.productVariant.findMany({
    where: {
      product: { id: productId, deletedAt: { isSet: false } },
      deletedAt: { isSet: false },
    },
    select: { id: true },
  });

  if (variants.length === 0) return { productId, totalUnitsSold: 0 };

  const variantIds = variants.map((v) => v.id);

  const result = await prisma.stockMovement.aggregate({
    where: {
      variantId: { in: variantIds },
      type: "SALE",
      ...(dateRange && {
        createdAt: { gte: dateRange.from, lte: dateRange.to },
      }),
    },
    _sum: { quantity: true },
  });

  return { productId, totalUnitsSold: Math.abs(result._sum.quantity ?? 0) };
};

export default getTotalSoldByProduct;
