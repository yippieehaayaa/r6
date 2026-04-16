import type { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../client.js";
import type { ListProductsInput, PaginatedResult } from "./types.js";

export async function listProducts(input: ListProductsInput) {
  const {
    tenantId,
    page = 1,
    limit = 20,
    search,
    status,
    categoryId,
    brandId,
  } = input;

  const where: Prisma.ProductWhereInput = {
    tenantId,
    deletedAt: null,
    ...(status && { status }),
    ...(categoryId && { categoryId }),
    ...(brandId && { brandId }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { sku: { contains: search, mode: "insensitive" as const } },
        { tags: { has: search.toLowerCase() } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: {
        id: true,
        tenantId: true,
        sku: true,
        name: true,
        slug: true,
        description: true,
        tags: true,
        metadata: true,
        status: true,
        categoryId: true,
        brandId: true,
        createdAt: true,
        updatedAt: true,
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true } },
        _count: { select: { variants: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return { data, page, limit, total } satisfies PaginatedResult<
    (typeof data)[number]
  >;
}
