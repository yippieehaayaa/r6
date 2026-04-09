import { type Prisma, prisma } from "../../../utils/prisma";

export type ListDamagesInput = {
  page: number;
  limit: number;
  variantId?: string;
  warehouseId?: string;
  from?: Date;
  to?: Date;
};

const buildWhere = (
  input: Omit<ListDamagesInput, "page" | "limit">,
): Prisma.StockMovementWhereInput => ({
  type: "DAMAGE",
  ...(input.variantId !== undefined && { variantId: input.variantId }),
  ...(input.warehouseId !== undefined && { warehouseId: input.warehouseId }),
  ...((input.from !== undefined || input.to !== undefined) && {
    createdAt: {
      ...(input.from !== undefined && { gte: input.from }),
      ...(input.to !== undefined && { lte: input.to }),
    },
  }),
});

const listDamages = async (input: ListDamagesInput) => {
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

export default listDamages;
