import { prisma } from "../../client.js";
import type { GetByIdInput } from "../catalog-query/types.js";

export async function getStockCount(input: GetByIdInput) {
  const { tenantId, id } = input;

  return prisma.stockCount.findFirst({
    where: { id, tenantId, deletedAt: null },
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
          isActive: true,
        },
      },
      items: {
        select: {
          id: true,
          quantityExpected: true,
          quantityActual: true,
          variance: true,
          varianceReason: true,
          isReconciled: true,
          variantId: true,
          lotId: true,
          binLocationId: true,
          variant: {
            select: {
              id: true,
              sku: true,
              name: true,
              trackingType: true,
            },
          },
          lot: {
            select: {
              id: true,
              lotNumber: true,
              quantityRemaining: true,
            },
          },
          binLocation: {
            select: {
              id: true,
              code: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}
