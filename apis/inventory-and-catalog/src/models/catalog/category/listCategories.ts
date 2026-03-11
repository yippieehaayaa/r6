import { type Prisma, prisma } from "../../../utils/prisma";

export type ListCategoriesInput = {
  page: number;
  limit: number;
  search?: string;
  parentId?: string;
  isActive?: boolean;
};

const buildWhere = (
  input: Omit<ListCategoriesInput, "page" | "limit">,
): Prisma.CategoryWhereInput => ({
  deletedAt: { isSet: false },
  ...(input.isActive !== undefined && { isActive: input.isActive }),
  ...(input.parentId !== undefined && { parentId: input.parentId }),
  ...(input.search && {
    name: { contains: input.search, mode: "insensitive" },
  }),
});

const listCategories = async (input: ListCategoriesInput) => {
  const where = buildWhere(input);
  const skip = (input.page - 1) * input.limit;

  const [data, total] = await Promise.all([
    prisma.category.findMany({
      where,
      skip,
      take: input.limit,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    }),
    prisma.category.count({ where }),
  ]);

  return { data, total, page: input.page, limit: input.limit };
};

export default listCategories;
