import { prisma } from "../../../utils/prisma";
import type { PHSeason } from "./types";

const getWarehouseTopProducts = async (
	warehouseId: string,
	limit: number,
	season?: PHSeason,
) => {
	const movements = await prisma.stockMovement.findMany({
		where: {
			warehouseId,
			type: "SALE",
			...(season && {
				createdAt: { gte: season.startDate, lte: season.endDate },
			}),
		},
		select: {
			quantity: true,
			variant: {
				select: {
					price: true,
					product: {
						select: {
							id: true,
							sku: true,
							name: true,
							slug: true,
						},
					},
				},
			},
		},
	});

	const productMap = new Map<
		string,
		{
			productId: string;
			sku: string;
			name: string;
			slug: string;
			totalUnitsSold: number;
			revenue: number;
		}
	>();

	for (const m of movements) {
		const { product, price } = m.variant;
		const existing = productMap.get(product.id) ?? {
			productId: product.id,
			sku: product.sku,
			name: product.name,
			slug: product.slug,
			totalUnitsSold: 0,
			revenue: 0,
		};
		existing.totalUnitsSold += Math.abs(m.quantity);
		existing.revenue += Math.abs(m.quantity) * price;
		productMap.set(product.id, existing);
	}

	const products = [...productMap.values()]
		.sort((a, b) => b.totalUnitsSold - a.totalUnitsSold)
		.slice(0, limit);

	return { warehouseId, season: season?.name, products };
};

export default getWarehouseTopProducts;
