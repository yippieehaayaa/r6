import { toMajorUnits } from "../../../utils/currency";
import { prisma, type Season } from "../../../utils/prisma";

const getWarehouseSalesBySeason = async (
  tenantSlug: string,
  warehouseId: string,
  seasons: Season[],
) => {
  const seasonalResults = await Promise.all(
    seasons.map(async (season) => {
      const movements = await prisma.stockMovement.findMany({
        where: {
          tenantSlug,
          warehouseId,
          type: "SALE",
          createdAt: { gte: season.startDate, lte: season.endDate },
        },
        select: {
          quantity: true,
          variant: { select: { price: true } },
        },
      });

      const totalUnitsSold = movements.reduce(
        (acc, m) => acc + Math.abs(m.quantity),
        0,
      );

      const revenue = movements.reduce(
        (acc, m) => acc + Math.abs(m.quantity) * m.variant.price,
        0,
      );

      return {
        season: season.name,
        startDate: season.startDate,
        endDate: season.endDate,
        totalUnitsSold,
        revenue: toMajorUnits(revenue),
      };
    }),
  );

  if (seasonalResults.length === 0) {
    return { warehouseId, seasons: [], dominantSeason: null };
  }

  const dominantSeason = seasonalResults.reduce((a, b) =>
    a.totalUnitsSold >= b.totalUnitsSold ? a : b,
  );

  return { warehouseId, seasons: seasonalResults, dominantSeason };
};

export default getWarehouseSalesBySeason;
