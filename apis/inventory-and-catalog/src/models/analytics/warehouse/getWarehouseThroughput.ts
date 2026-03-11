import { prisma } from "../../../utils/prisma";
import type { DateRange } from "./types";

const getWarehouseThroughput = async (
	warehouseId: string,
	dateRange?: DateRange,
) => {
	const dateFilter = dateRange
		? { createdAt: { gte: dateRange.from, lte: dateRange.to } }
		: {};

	const [inbound, outbound] = await Promise.all([
		prisma.stockMovement.aggregate({
			where: {
				warehouseId,
				type: "RECEIPT",
				...dateFilter,
			},
			_sum: { quantity: true },
		}),
		prisma.stockMovement.aggregate({
			where: {
				warehouseId,
				type: { in: ["SALE", "TRANSFER_OUT"] },
				...dateFilter,
			},
			_sum: { quantity: true },
		}),
	]);

	const totalIn = inbound._sum.quantity ?? 0;
	const totalOut = Math.abs(outbound._sum.quantity ?? 0);

	return { warehouseId, totalIn, totalOut, netFlow: totalIn - totalOut };
};

export default getWarehouseThroughput;
