import type { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../client.js";
import type { ListStockCountsInput, PaginatedResult } from "./types.js";

export async function listStockCounts(input: ListStockCountsInput) {
  const { tenantId, page = 1, limit = 20, search, status, warehouseId } = input;

  const where: Prisma.StockCountWhereInput = {
    tenantId,
    deletedAt: null,
    ...(status && { status }),
    ...(warehouseId && { warehouseId }),
    ...(search && {
      OR: [
        { notes: { contains: search, mode: "insensitive" as const } },
        { countType: { contains: search, mode: "insensitive" as const } },
        {
          warehouse: {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { code: { contains: search, mode: "insensitive" as const } },
            ],
          },
        },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.stockCount.findMany({
      where,
      select: {
        id: true,
        tenantId: true,
        countType: true,
        status: true,
        startedAt: true,
        completedAt: true,
        notes: true,
        performedBy: true,
        supervisedBy: true,
        warehouseId: true,
        createdAt: true,
        updatedAt: true,
        warehouse: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.stockCount.count({ where }),
  ]);

  return { data, page, limit, total } satisfies PaginatedResult<
    (typeof data)[number]
  >;
}
