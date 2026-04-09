import { type Prisma, prisma } from "../../../utils/prisma";

export type ListWarehousesInput = {
  page: number;
  limit: number;
  search?: string;
  isActive?: boolean;
};

const buildWhere = (
  tenantSlug: string,
  input: Omit<ListWarehousesInput, "page" | "limit">,
): Prisma.WarehouseWhereInput => ({
  tenantSlug,
  deletedAt: { isSet: false },
  ...(input.isActive !== undefined && { isActive: input.isActive }),
  ...(input.search && {
    name: { contains: input.search, mode: "insensitive" },
  }),
});

const listWarehouses = async (
  tenantSlug: string,
  input: ListWarehousesInput,
) => {
  const where = buildWhere(tenantSlug, input);
  const skip = (input.page - 1) * input.limit;

  const [data, total] = await Promise.all([
    prisma.warehouse.findMany({
      where,
      skip,
      take: input.limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.warehouse.count({ where }),
  ]);

  return { data, total, page: input.page, limit: input.limit };
};

export default listWarehouses;
