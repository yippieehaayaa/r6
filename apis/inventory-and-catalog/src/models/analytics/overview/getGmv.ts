import { prisma } from "../../../utils/prisma";
import type { DateRange } from "../brand/types";

const getGmv = async (dateRange?: DateRange) => {
	const movements = await prisma.stockMovement.findMany({
		where: {
			type: "SALE",
			...(dateRange && {
				createdAt: { gte: dateRange.from, lte: dateRange.to },
			}),
		},
		select: {
			quantity: true,
			variant: { select: { price: true } },
		},
	});

	let gmv = 0;
	let totalUnitsSold = 0;

	for (const m of movements) {
		const units = Math.abs(m.quantity);
		gmv += units * m.variant.price;
		totalUnitsSold += units;
	}

	return { gmv, totalUnitsSold, movementCount: movements.length };
};

export default getGmv;
