import { prisma } from "../../../utils/prisma";
import type { PHSeason } from "./types";

const getBrandSeasonalSales = async (brandId: string, seasons: PHSeason[]) => {
  const variants = await prisma.productVariant.findMany({
    where: {
      product: { brandId, deletedAt: { isSet: false } },
      deletedAt: { isSet: false },
    },
    select: { id: true, price: true },
  });

  if (variants.length === 0) {
    return { brandId, seasons: [], bestSeason: null, worstSeason: null };
  }

  const priceMap = new Map(variants.map((v) => [v.id, v.price]));
  const variantIds = variants.map((v) => v.id);

  const seasonalResults = await Promise.all(
    seasons.map(async (season) => {
      const movements = await prisma.stockMovement.findMany({
        where: {
          variantId: { in: variantIds },
          type: "SALE",
          createdAt: { gte: season.startDate, lte: season.endDate },
        },
        select: { quantity: true, variantId: true },
      });

      const totalUnitsSold = movements.reduce(
        (acc, m) => acc + Math.abs(m.quantity),
        0,
      );

      const revenue = movements.reduce((acc, m) => {
        const price = priceMap.get(m.variantId) ?? 0;
        return acc + Math.abs(m.quantity) * price;
      }, 0);

      return {
        season: season.name,
        startDate: season.startDate,
        endDate: season.endDate,
        totalUnitsSold,
        revenue,
      };
    }),
  );

  if (seasonalResults.length === 0) {
    return { brandId, seasons: [], bestSeason: null, worstSeason: null };
  }

  const bestSeason = seasonalResults.reduce((a, b) =>
    a.totalUnitsSold >= b.totalUnitsSold ? a : b,
  );

  const worstSeason = seasonalResults.reduce((a, b) =>
    a.totalUnitsSold <= b.totalUnitsSold ? a : b,
  );

  return { brandId, seasons: seasonalResults, bestSeason, worstSeason };
};

export default getBrandSeasonalSales;
