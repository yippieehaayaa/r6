import { type Prisma, prisma } from "../../../utils/prisma";

export type ListSeasonsInput = {
  page: number;
  limit: number;
  search?: string;
  isActive?: boolean;
  year?: number;
};

const buildWhere = (
  tenantSlug: string,
  input: Omit<ListSeasonsInput, "page" | "limit">,
): Prisma.SeasonWhereInput => ({
  tenantSlug,
  deletedAt: { isSet: false },
  ...(input.year !== undefined && { year: input.year }),
  ...(input.isActive !== undefined && { isActive: input.isActive }),
  ...(input.search && {
    name: { contains: input.search, mode: "insensitive" },
  }),
});

const listSeasons = async (tenantSlug: string, input: ListSeasonsInput) => {
  const where = buildWhere(tenantSlug, input);
  const skip = (input.page - 1) * input.limit;

  const [data, total] = await Promise.all([
    prisma.season.findMany({
      where,
      skip,
      take: input.limit,
      // Newest year first; within a year, chronological by start date
      orderBy: [{ year: "desc" }, { startDate: "asc" }],
    }),
    prisma.season.count({ where }),
  ]);

  return { data, total, page: input.page, limit: input.limit };
};

export default listSeasons;
