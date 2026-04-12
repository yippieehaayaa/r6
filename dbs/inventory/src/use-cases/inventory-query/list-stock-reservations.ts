import type { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../client.js";
import type { ListStockReservationsInput, PaginatedResult } from "./types.js";

export async function listStockReservations(input: ListStockReservationsInput) {
  const {
    tenantId,
    page = 1,
    limit = 20,
    variantId,
    warehouseId,
    status,
    referenceId,
    referenceType,
  } = input;

  const where: Prisma.StockReservationWhereInput = {
    tenantId,
    ...(variantId && { variantId }),
    ...(warehouseId && { warehouseId }),
    ...(status && { status }),
    ...(referenceId && { referenceId }),
    ...(referenceType && { referenceType }),
  };

  const [data, total] = await Promise.all([
    prisma.stockReservation.findMany({
      where,
      select: {
        id: true,
        tenantId: true,
        quantity: true,
        status: true,
        expiresAt: true,
        fulfilledAt: true,
        releasedAt: true,
        referenceId: true,
        referenceType: true,
        reservedBy: true,
        variantId: true,
        warehouseId: true,
        createdAt: true,
        updatedAt: true,
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
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.stockReservation.count({ where }),
  ]);

  return { data, page, limit, total } satisfies PaginatedResult<
    (typeof data)[number]
  >;
}
