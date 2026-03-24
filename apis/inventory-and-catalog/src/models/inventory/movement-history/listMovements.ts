import { type MovementType, type Prisma, prisma } from "../../../utils/prisma";

export type ListMovementsInput = {
	variantId: string;
	page: number;
	limit: number;
	type?: MovementType;
	warehouseId?: string;
	from?: Date;
	to?: Date;
};

const buildWhere = (
	input: Omit<ListMovementsInput, "page" | "limit">,
): Prisma.StockMovementWhereInput => ({
	variantId: input.variantId,
	...(input.type !== undefined && { type: input.type }),
	...(input.warehouseId !== undefined && { warehouseId: input.warehouseId }),
	...((input.from !== undefined || input.to !== undefined) && {
		createdAt: {
			...(input.from !== undefined && { gte: input.from }),
			...(input.to !== undefined && { lte: input.to }),
		},
	}),
});

const listMovements = async (input: ListMovementsInput) => {
	const where = buildWhere(input);
	const skip = (input.page - 1) * input.limit;

	const [data, total] = await Promise.all([
		prisma.stockMovement.findMany({
			where,
			skip,
			take: input.limit,
			orderBy: { createdAt: "desc" },
		}),
		prisma.stockMovement.count({ where }),
	]);

	return { data, total, page: input.page, limit: input.limit };
};

export default listMovements;
