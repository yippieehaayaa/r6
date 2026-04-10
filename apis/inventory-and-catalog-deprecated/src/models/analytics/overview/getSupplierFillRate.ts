import { prisma } from "../../../utils/prisma";
import type { DateRange } from "../brand/types";

const getSupplierFillRate = async (
  tenantSlug: string,
  supplierId: string,
  dateRange?: DateRange,
) => {
  const purchaseOrders = await prisma.purchaseOrder.findMany({
    where: {
      tenantSlug,
      supplierId,
      deletedAt: { isSet: false },
      ...(dateRange && {
        createdAt: { gte: dateRange.from, lte: dateRange.to },
      }),
    },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      expectedAt: true,
      createdAt: true,
      items: {
        select: {
          quantityOrdered: true,
          quantityReceived: true,
        },
      },
    },
  });

  let totalOrdered = 0;
  let totalReceived = 0;

  const orders = purchaseOrders.map((po) => {
    const ordered = po.items.reduce((acc, i) => acc + i.quantityOrdered, 0);
    const received = po.items.reduce((acc, i) => acc + i.quantityReceived, 0);
    totalOrdered += ordered;
    totalReceived += received;

    return {
      purchaseOrderId: po.id,
      orderNumber: po.orderNumber,
      status: po.status,
      expectedAt: po.expectedAt,
      createdAt: po.createdAt,
      ordered,
      received,
      fillRate: ordered > 0 ? received / ordered : null,
    };
  });

  return {
    supplierId,
    overallFillRate: totalOrdered > 0 ? totalReceived / totalOrdered : null,
    totalOrdered,
    totalReceived,
    orders,
  };
};

export default getSupplierFillRate;
