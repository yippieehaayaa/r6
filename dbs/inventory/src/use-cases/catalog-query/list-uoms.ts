import type { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../client.js";
import type { ListUomsInput, PaginatedResult } from "./types.js";

export async function listUoms(input: ListUomsInput) {
  const { tenantId, page = 1, limit = 20, search, uomType, isActive } = input;

  const where: Prisma.UnitOfMeasureWhereInput = {
    tenantId,
    deletedAt: null,
    ...(uomType && { uomType }),
    ...(isActive !== undefined && { isActive }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { abbreviation: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.unitOfMeasure.findMany({
      where,
      select: {
        id: true,
        tenantId: true,
        name: true,
        abbreviation: true,
        uomType: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { productVariants: true } },
      },
      orderBy: [{ uomType: "asc" }, { name: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.unitOfMeasure.count({ where }),
  ]);

  return { data, page, limit, total } satisfies PaginatedResult<
    (typeof data)[number]
  >;
}
