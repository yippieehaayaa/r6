import { prisma } from "../../../utils/prisma";
import type { PHSeason } from "./types";

const compareWarehousesBySeasonalDemand = async (season: PHSeason) => {
  const warehouses = await prisma.warehouse.findMany({
    where: { deletedAt: { isSet: false }, isActive: true },
    select: { id: true, name: true, code: true },
  });

  if (warehouses.length === 0) {
    return {
      season: season.name,
      startDate: season.startDate,
      endDate: season.endDate,
      warehouses: [],
    };
  }

  const results = await Promise.all(
    warehouses.map(async (wh) => {
      const movements = await prisma.stockMovement.findMany({
        where: {
          warehouseId: wh.id,
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
        warehouseId: wh.id,
        warehouseName: wh.name,
        warehouseCode: wh.code,
        totalUnitsSold,
        revenue,
      };
    }),
  );

  const sorted = results.sort((a, b) => b.totalUnitsSold - a.totalUnitsSold);

  return {
    season: season.name,
    startDate: season.startDate,
    endDate: season.endDate,
    warehouses: sorted,
  };
};

export default compareWarehousesBySeasonalDemand;
