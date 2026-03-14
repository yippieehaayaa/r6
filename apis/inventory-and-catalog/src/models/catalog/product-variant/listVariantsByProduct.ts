import { type Prisma, prisma } from "../../../utils/prisma";

export type ListVariantsByProductInput = {
  productId: string;
  page: number;
  limit: number;
  search?: string;
  isActive?: boolean;
};

const buildWhere = (
  input: Omit<ListVariantsByProductInput, "page" | "limit">,
): Prisma.ProductVariantWhereInput => ({
  deletedAt: { isSet: false },
  productId: input.productId,
  ...(input.isActive !== undefined && { isActive: input.isActive }),
  ...(input.search && {
    name: { contains: input.search, mode: "insensitive" },
  }),
});

const listVariantsByProduct = async (input: ListVariantsByProductInput) => {
  const where = buildWhere(input);
  const skip = (input.page - 1) * input.limit;

  const [data, total] = await Promise.all([
    prisma.productVariant.findMany({
      where,
      skip,
      take: input.limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.productVariant.count({ where }),
  ]);

  return { data, total, page: input.page, limit: input.limit };
};

export default listVariantsByProduct;
