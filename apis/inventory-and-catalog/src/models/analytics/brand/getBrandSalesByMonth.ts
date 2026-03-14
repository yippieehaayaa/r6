import { toMajorUnits } from "../../../utils/currency";
import { prisma } from "../../../utils/prisma";

const getBrandSalesByMonth = async (brandId: string, year: number) => {
  const variants = await prisma.productVariant.findMany({
    where: {
      product: { brandId, deletedAt: { isSet: false } },
      deletedAt: { isSet: false },
    },
    select: { id: true, price: true },
  });

  const emptyMonths = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    totalUnitsSold: 0,
    revenue: 0,
  }));

  if (variants.length === 0) return { brandId, year, months: emptyMonths };

  const priceMap = new Map(variants.map((v) => [v.id, v.price]));
  const variantIds = variants.map((v) => v.id);

  const movements = await prisma.stockMovement.findMany({
    where: {
      variantId: { in: variantIds },
      type: "SALE",
      createdAt: {
        gte: new Date(`${year}-01-01T00:00:00.000Z`),
        lte: new Date(`${year}-12-31T23:59:59.999Z`),
      },
    },
    select: { quantity: true, variantId: true, createdAt: true },
  });

  const monthly = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    totalUnitsSold: 0,
    revenue: 0,
  }));

  for (const m of movements) {
    const monthIndex = m.createdAt.getUTCMonth();
    const price = priceMap.get(m.variantId) ?? 0;
    const entry = monthly[monthIndex];
    if (!entry) continue;
    entry.totalUnitsSold += Math.abs(m.quantity);
    entry.revenue += Math.abs(m.quantity) * price;
  }

  return {
    brandId,
    year,
    months: monthly.map((m) => ({
      ...m,
      revenue: toMajorUnits(m.revenue),
    })),
  };
};

export default getBrandSalesByMonth;
