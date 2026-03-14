import {
  PurchaseOrderInvalidStatusTransitionError,
  PurchaseOrderNotFoundError,
} from "../../../utils/errors";
import { prisma } from "../../../utils/prisma";

const cancelPurchaseOrder = async (id: string) => {
  const po = await prisma.purchaseOrder.findUnique({
    where: { id, deletedAt: { isSet: false } },
  });

  if (!po) throw new PurchaseOrderNotFoundError();
  if (po.status === "RECEIVED")
    throw new PurchaseOrderInvalidStatusTransitionError();

  return await prisma.purchaseOrder.update({
    where: { id },
    data: { status: "CANCELLED" },
  });
};

export default cancelPurchaseOrder;
