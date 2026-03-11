import {
  PurchaseOrderInvalidStatusTransitionError,
  PurchaseOrderItemNotFoundError,
  PurchaseOrderNotFoundError,
} from "../../../utils/errors";
import { prisma } from "../../../utils/prisma";

const removeItemFromOrder = async (
  purchaseOrderId: string,
  variantId: string,
) => {
  const po = await prisma.purchaseOrder.findUnique({
    where: { id: purchaseOrderId, deletedAt: { isSet: false } },
  });

  if (!po) throw new PurchaseOrderNotFoundError();
  if (po.status !== "DRAFT")
    throw new PurchaseOrderInvalidStatusTransitionError();

  const item = await prisma.purchaseOrderItem.findUnique({
    where: { purchaseOrderId_variantId: { purchaseOrderId, variantId } },
  });

  if (!item) throw new PurchaseOrderItemNotFoundError();

  return await prisma.purchaseOrderItem.delete({
    where: { purchaseOrderId_variantId: { purchaseOrderId, variantId } },
  });
};

export default removeItemFromOrder;
