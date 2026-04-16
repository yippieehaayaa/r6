import { prisma } from "../../client.js";
import type { GetByIdInput } from "../catalog-query/types.js";

export async function getReturnRequest(input: GetByIdInput) {
  const { tenantId, id } = input;

  return prisma.returnRequest.findFirst({
    where: { id, tenantId, deletedAt: null },
    select: {
      id: true,
      tenantId: true,
      returnReason: true,
      status: true,
      approvedAt: true,
      receivedAt: true,
      completedAt: true,
      performedBy: true,
      approvedBy: true,
      referenceId: true,
      referenceType: true,
      createdAt: true,
      updatedAt: true,
      items: {
        select: {
          id: true,
          quantityReturned: true,
          disposition: true,
          dispositionNotes: true,
          variantId: true,
          lotId: true,
          serialNumber: true,
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
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}
