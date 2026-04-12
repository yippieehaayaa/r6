import type { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../client.js";
import type { ListStockTransfersInput, PaginatedResult } from "./types.js";

export async function listStockTransfers(input: ListStockTransfersInput) {
  const {
    tenantId,
    page = 1,
    limit = 20,
    search,
    status,
    fromWarehouseId,
    toWarehouseId,
  } = input;

  const where: Prisma.StockTransferWhereInput = {
    tenantId,
    deletedAt: null,
    ...(status && { status }),
    ...(fromWarehouseId && { fromWarehouseId }),
    ...(toWarehouseId && { toWarehouseId }),
    ...(search && {
      OR: [
        { notes: { contains: search, mode: "insensitive" as const } },
        {
          fromWarehouse: {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { code: { contains: search, mode: "insensitive" as const } },
            ],
          },
        },
        {
          toWarehouse: {
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
    prisma.stockTransfer.findMany({
      where,
      select: {
        id: true,
        tenantId: true,
        status: true,
        expectedAt: true,
        dispatchedAt: true,
        completedAt: true,
        cancelledAt: true,
        notes: true,
        performedBy: true,
        fromWarehouseId: true,
        toWarehouseId: true,
        createdAt: true,
        updatedAt: true,
        fromWarehouse: {
          select: { id: true, name: true, code: true },
        },
        toWarehouse: {
          select: { id: true, name: true, code: true },
        },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.stockTransfer.count({ where }),
  ]);

  return { data, page, limit, total } satisfies PaginatedResult<
    (typeof data)[number]
  >;
}
