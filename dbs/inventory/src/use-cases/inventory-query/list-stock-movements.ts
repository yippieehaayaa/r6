import type { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../client.js";
import type { ListStockMovementsInput, PaginatedResult } from "./types.js";

export async function listStockMovements(input: ListStockMovementsInput) {
  const {
    tenantId,
    page = 1,
    limit = 20,
    type,
    variantId,
    warehouseId,
    fromCreatedAt,
    toCreatedAt,
    referenceId,
    referenceType,
  } = input;

  const where: Prisma.StockMovementWhereInput = {
    tenantId,
    ...(type && { type }),
    ...(variantId && { variantId }),
    ...(warehouseId && { warehouseId }),
    ...(referenceId && { referenceId }),
    ...(referenceType && { referenceType }),
    ...((fromCreatedAt || toCreatedAt) && {
      createdAt: {
        ...(fromCreatedAt && { gte: new Date(fromCreatedAt) }),
        ...(toCreatedAt && { lte: new Date(toCreatedAt) }),
      },
    }),
  };

  const [data, total] = await Promise.all([
    prisma.stockMovement.findMany({
      where,
      select: {
        id: true,
        tenantId: true,
        type: true,
        quantity: true,
        unitCostSnapshot: true,
        costCurrency: true,
        referenceId: true,
        referenceType: true,
        notes: true,
        performedBy: true,
        variantId: true,
        warehouseId: true,
        lotId: true,
        createdAt: true,
        variant: {
          select: {
            id: true,
            sku: true,
            name: true,
          },
        },
        warehouse: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        lot: {
          select: {
            id: true,
            lotNumber: true,
            quantityRemaining: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.stockMovement.count({ where }),
  ]);

  return { data, page, limit, total } satisfies PaginatedResult<
    (typeof data)[number]
  >;
}
