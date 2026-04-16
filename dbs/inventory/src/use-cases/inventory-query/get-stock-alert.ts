import { prisma } from "../../client.js";
import type { GetByIdInput } from "../catalog-query/types.js";

export async function getStockAlert(input: GetByIdInput) {
  const { tenantId, id } = input;

  return prisma.stockAlert.findFirst({
    where: { id, tenantId },
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
          barcode: true,
          trackingType: true,
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
      lot: {
        select: {
          id: true,
          lotNumber: true,
          expiresAt: true,
          receivedAt: true,
          quantityRemaining: true,
          isQuarantined: true,
        },
      },
    },
  });
}
