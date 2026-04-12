import { prisma } from "../../client.js";
import type { GetByIdInput } from "../catalog-query/types.js";

export async function getStockTransfer(input: GetByIdInput) {
  const { tenantId, id } = input;

  return prisma.stockTransfer.findFirst({
    where: { id, tenantId, deletedAt: null },
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
        select: {
          id: true,
          name: true,
          code: true,
          isActive: true,
        },
      },
      toWarehouse: {
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
          quantityRequested: true,
          quantityShipped: true,
          quantityReceived: true,
          variantId: true,
          lotId: true,
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
              unitCost: true,
              unitCostCurrency: true,
              quantityRemaining: true,
              receivedAt: true,
              expiresAt: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}
