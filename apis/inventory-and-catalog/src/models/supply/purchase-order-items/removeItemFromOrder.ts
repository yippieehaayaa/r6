import {
  PurchaseOrderInvalidStatusTransitionError,
  PurchaseOrderItemNotFoundError,
  PurchaseOrderNotFoundError,
} from "../../../utils/errors";
import { prisma } from "../../../utils/prisma";

const removeItemFromOrder = async (
  tenantSlug: string,
  purchaseOrderId: string,
  variantId: string,
) => {
  const po = await prisma.purchaseOrder.findUnique({
    where: { id: purchaseOrderId, tenantSlug, deletedAt: { isSet: false } },
  });

  if (!po) throw new PurchaseOrderNotFoundError();
  if (po.status !== "DRAFT")
    throw new PurchaseOrderInvalidStatusTransitionError();

  const item = await prisma.purchaseOrderItem.findUnique({
    where: {
      tenantSlug_purchaseOrderId_variantId: {
        tenantSlug,
        purchaseOrderId,
        variantId,
      },
    },
  });

  if (!item) throw new PurchaseOrderItemNotFoundError();

  return await prisma.purchaseOrderItem.delete({
    where: {
      tenantSlug_purchaseOrderId_variantId: {
        tenantSlug,
        purchaseOrderId,
        variantId,
      },
    },
  });
};

export default removeItemFromOrder;
