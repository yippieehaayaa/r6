import { prisma, type Season } from "../../../utils/prisma";

const shiftDateByYears = (date: Date, offsetYears: number): Date =>
  new Date(
    Date.UTC(
      date.getUTCFullYear() - offsetYears,
      date.getUTCMonth(),
      date.getUTCDate(),
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
      date.getUTCMilliseconds(),
    ),
  );

const getProductSeasonalForecast = async (
  tenantSlug: string,
  productId: string,
  upcomingSeason: Season,
  yearsBack = 3,
) => {
  const emptyResult = {
    productId,
    upcomingSeason: upcomingSeason.name,
    forecastUnitsSold: 0,
    suggestedReorderQty: 0,
    historicalData: [] as { year: number; unitsSold: number }[],
  };

  const variants = await prisma.productVariant.findMany({
    where: {
      tenantSlug,
      product: { id: productId, deletedAt: { isSet: false } },
      deletedAt: { isSet: false },
    },
    select: { id: true },
  });

  if (variants.length === 0) return emptyResult;

  const variantIds = variants.map((v) => v.id);

  const historicalData = await Promise.all(
    Array.from({ length: yearsBack }, (_, i) => i + 1).map(async (offset) => {
      const from = shiftDateByYears(upcomingSeason.startDate, offset);
      const to = shiftDateByYears(upcomingSeason.endDate, offset);

      const result = await prisma.stockMovement.aggregate({
        where: {
          tenantSlug,
          variantId: { in: variantIds },
          type: "SALE",
          createdAt: { gte: from, lte: to },
        },
        _sum: { quantity: true },
      });

      return {
        year: upcomingSeason.startDate.getUTCFullYear() - offset,
        unitsSold: Math.abs(result._sum.quantity ?? 0),
      };
    }),
  );

  const nonZeroYears = historicalData.filter((d) => d.unitsSold > 0);

  if (nonZeroYears.length === 0) return { ...emptyResult, historicalData };

  const forecastUnitsSold =
    nonZeroYears.reduce((acc, d) => acc + d.unitsSold, 0) / nonZeroYears.length;

  const suggestedReorderQty = Math.ceil(forecastUnitsSold);

  return {
    productId,
    upcomingSeason: upcomingSeason.name,
    forecastUnitsSold,
    suggestedReorderQty,
    historicalData,
  };
};

export default getProductSeasonalForecast;
