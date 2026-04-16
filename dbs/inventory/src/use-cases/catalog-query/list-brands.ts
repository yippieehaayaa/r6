import type { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../client.js";
import type { ListBrandsInput, PaginatedResult } from "./types.js";

export async function listBrands(input: ListBrandsInput) {
  const { tenantId, page = 1, limit = 20, search, isActive } = input;

  const where: Prisma.BrandWhereInput = {
    tenantId,
    deletedAt: null,
    ...(isActive !== undefined && { isActive }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { slug: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.brand.findMany({
      where,
      select: {
        id: true,
        tenantId: true,
        name: true,
        slug: true,
        description: true,
        logoUrl: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { products: true } },
      },
      orderBy: { name: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.brand.count({ where }),
  ]);

  return { data, page, limit, total } satisfies PaginatedResult<
    (typeof data)[number]
  >;
}
