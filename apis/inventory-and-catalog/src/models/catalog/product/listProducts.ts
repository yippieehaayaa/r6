import { type Prisma, type ProductStatus, prisma } from "../../../utils/prisma";

export type ListProductsInput = {
  page: number;
  limit: number;
  search?: string;
  categoryId?: string;
  brandId?: string;
  status?: ProductStatus;
  tags?: string[];
};

const buildWhere = (
  input: Omit<ListProductsInput, "page" | "limit">,
): Prisma.ProductWhereInput => ({
  deletedAt: { isSet: false },
  ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
  ...(input.brandId !== undefined && { brandId: input.brandId }),
  ...(input.status !== undefined && { status: input.status }),
  ...(input.tags && input.tags.length > 0 && { tags: { hasSome: input.tags } }),
  ...(input.search && {
    name: { contains: input.search, mode: "insensitive" },
  }),
});

const listProducts = async (input: ListProductsInput) => {
  const where = buildWhere(input);
  const skip = (input.page - 1) * input.limit;

  const [data, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: input.limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count({ where }),
  ]);

  return { data, total, page: input.page, limit: input.limit };
};

export default listProducts;
