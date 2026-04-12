import type { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../client.js";
import type { ListInventoryLotsInput, PaginatedResult } from "./types.js";

export async function listInventoryLots(input: ListInventoryLotsInput) {
  const {
    tenantId,
    page = 1,
    limit = 20,
    search,
    variantId,
    warehouseId,
    isQuarantined,
  } = input;

  const where: Prisma.InventoryLotWhereInput = {
    tenantId,
    deletedAt: null,
    ...(variantId && { variantId }),
    ...(warehouseId && { warehouseId }),
    ...(isQuarantined !== undefined && { isQuarantined }),
    ...(search && {
      OR: [
        { lotNumber: { contains: search, mode: "insensitive" as const } },
        { notes: { contains: search, mode: "insensitive" as const } },
        {
          variant: {
            OR: [
              { sku: { contains: search, mode: "insensitive" as const } },
              { name: { contains: search, mode: "insensitive" as const } },
            ],
          },
        },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.inventoryLot.findMany({
      where,
      select: {
        id: true,
        tenantId: true,
        lotNumber: true,
        quantityReceived: true,
        quantityRemaining: true,
        unitCost: true,
        unitCostCurrency: true,
        receivedAt: true,
        expiresAt: true,
        manufacturedAt: true,
        isQuarantined: true,
        quarantineReason: true,
        notes: true,
        referenceId: true,
        referenceType: true,
        variantId: true,
        warehouseId: true,
        binLocationId: true,
        createdAt: true,
        updatedAt: true,
        variant: {
          select: {
            id: true,
            sku: true,
            name: true,
            trackingType: true,
          },
        },
        warehouse: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        binLocation: {
          select: {
            id: true,
            code: true,
          },
        },
      },
      orderBy: [{ receivedAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.inventoryLot.count({ where }),
  ]);

  return { data, page, limit, total } satisfies PaginatedResult<
    (typeof data)[number]
  >;
}
