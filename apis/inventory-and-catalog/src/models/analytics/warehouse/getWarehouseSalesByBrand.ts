import { prisma } from "../../../utils/prisma";
import type { DateRange } from "./types";

const getWarehouseSalesByBrand = async (
	warehouseId: string,
	dateRange?: DateRange,
) => {
	const movements = await prisma.stockMovement.findMany({
		where: {
			warehouseId,
			type: "SALE",
			...(dateRange && {
				createdAt: { gte: dateRange.from, lte: dateRange.to },
			}),
		},
		select: {
			quantity: true,
			variant: {
				select: {
					price: true,
					product: {
						select: {
							brand: { select: { id: true, name: true } },
						},
					},
				},
			},
		},
	});

	const brandMap = new Map<
		string,
		{
			brandId: string;
			brandName: string;
			totalUnitsSold: number;
			revenue: number;
		}
	>();

	for (const m of movements) {
		const brand = m.variant.product.brand;
		if (!brand) continue;

		const existing = brandMap.get(brand.id) ?? {
			brandId: brand.id,
			brandName: brand.name,
			totalUnitsSold: 0,
			revenue: 0,
		};
		existing.totalUnitsSold += Math.abs(m.quantity);
		existing.revenue += Math.abs(m.quantity) * m.variant.price;
		brandMap.set(brand.id, existing);
	}

	const brands = [...brandMap.values()].sort(
		(a, b) => b.totalUnitsSold - a.totalUnitsSold,
	);

	return { warehouseId, brands };
};

export default getWarehouseSalesByBrand;
