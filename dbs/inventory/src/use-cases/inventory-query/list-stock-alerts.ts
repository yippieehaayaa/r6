import type { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../client.js";
import type { ListStockAlertsInput, PaginatedResult } from "./types.js";

export async function listStockAlerts(input: ListStockAlertsInput) {
  const {
    tenantId,
    page = 1,
    limit = 20,
    search,
    status,
    alertType,
    variantId,
    warehouseId,
  } = input;

  const where: Prisma.StockAlertWhereInput = {
    tenantId,
    ...(status && { status }),
    ...(alertType && { alertType }),
    ...(variantId && { variantId }),
    ...(warehouseId && { warehouseId }),
    ...(search && {
      OR: [
        { notes: { contains: search, mode: "insensitive" as const } },
        {
          variant: {
            OR: [
              { sku: { contains: search, mode: "insensitive" as const } },
              { name: { contains: search, mode: "insensitive" as const } },
            ],
          },
        },
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
    prisma.stockAlert.findMany({
      where,
      select: {
        id: true,
        tenantId: true,
        alertType: true,
        status: true,
        threshold: true,
        currentQty: true,
        resolvedAt: true,
        resolvedBy: true,
        notes: true,
        variantId: true,
        warehouseId: true,
        lotId: true,
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
        lot: {
          select: {
            id: true,
            lotNumber: true,
            expiresAt: true,
            quantityRemaining: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.stockAlert.count({ where }),
  ]);

  return { data, page, limit, total } satisfies PaginatedResult<
    (typeof data)[number]
  >;
}
