import { type Prisma, prisma } from "../../../utils/prisma";

export type ListSuppliersInput = {
  page: number;
  limit: number;
  search?: string;
  isActive?: boolean;
};

const buildWhere = (
  tenantSlug: string,
  input: Omit<ListSuppliersInput, "page" | "limit">,
): Prisma.SupplierWhereInput => ({
  tenantSlug,
  deletedAt: { isSet: false },
  ...(input.isActive !== undefined && { isActive: input.isActive }),
  ...(input.search && {
    name: { contains: input.search, mode: "insensitive" },
  }),
});

const listSuppliers = async (tenantSlug: string, input: ListSuppliersInput) => {
  const where = buildWhere(tenantSlug, input);
  const skip = (input.page - 1) * input.limit;

  const [data, total] = await Promise.all([
    prisma.supplier.findMany({
      where,
      skip,
      take: input.limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.supplier.count({ where }),
  ]);

  return { data, total, page: input.page, limit: input.limit };
};

export default listSuppliers;
