import type { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../client.js";
import type { ListInventoryItemsInput, PaginatedResult } from "./types.js";

export async function listInventoryItems(input: ListInventoryItemsInput) {
  const {
    tenantId,
    page = 1,
    limit = 20,
    search,
    warehouseId,
    variantId,
  } = input;

  const where: Prisma.InventoryItemWhereInput = {
    tenantId,
    deletedAt: null,
    ...(warehouseId && { warehouseId }),
    ...(variantId && { variantId }),
    ...(search && {
      variant: {
        deletedAt: null,
        OR: [
          { sku: { contains: search, mode: "insensitive" as const } },
          { name: { contains: search, mode: "insensitive" as const } },
        ],
      },
    }),
  };

  const [data, total] = await Promise.all([
    prisma.inventoryItem.findMany({
      where,
      select: {
        id: true,
        tenantId: true,
        quantityOnHand: true,
        quantityReserved: true,
        reorderPoint: true,
        reorderQuantity: true,
        overstockThreshold: true,
        variantId: true,
        warehouseId: true,
        createdAt: true,
        updatedAt: true,
        variant: {
          select: {
            id: true,
            sku: true,
            name: true,
            barcode: true,
            trackingType: true,
            isActive: true,
            productId: true,
            product: {
              select: {
                id: true,
                sku: true,
                name: true,
                status: true,
              },
            },
          },
        },
        warehouse: {
          select: {
            id: true,
            name: true,
            code: true,
            isActive: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.inventoryItem.count({ where }),
  ]);

  return { data, page, limit, total } satisfies PaginatedResult<
    (typeof data)[number]
  >;
}
