import type { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../client.js";
import type { ListCategoriesInput, PaginatedResult } from "./types.js";

export async function listCategories(input: ListCategoriesInput) {
  const { tenantId, page = 1, limit = 20, search, parentId, isActive } = input;

  const where: Prisma.CategoryWhereInput = {
    tenantId,
    deletedAt: null,
    ...(isActive !== undefined && { isActive }),
    ...(parentId !== undefined && { parentId }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { slug: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.category.findMany({
      where,
      select: {
        id: true,
        tenantId: true,
        name: true,
        slug: true,
        description: true,
        parentId: true,
        path: true,
        sortOrder: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        parent: { select: { id: true, name: true, slug: true } },
        _count: { select: { children: true, products: true } },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.category.count({ where }),
  ]);

  return { data, page, limit, total } satisfies PaginatedResult<
    (typeof data)[number]
  >;
}
