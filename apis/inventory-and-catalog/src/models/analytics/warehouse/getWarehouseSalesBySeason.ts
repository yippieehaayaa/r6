import { prisma } from "../../../utils/prisma";
import type { PHSeason } from "./types";

const getWarehouseSalesBySeason = async (
	warehouseId: string,
	seasons: PHSeason[],
) => {
	const seasonalResults = await Promise.all(
		seasons.map(async (season) => {
			const movements = await prisma.stockMovement.findMany({
				where: {
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
				revenue,
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
