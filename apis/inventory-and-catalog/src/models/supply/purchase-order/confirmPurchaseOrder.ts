import {
  PurchaseOrderInvalidStatusTransitionError,
  PurchaseOrderNotFoundError,
} from "../../../utils/errors";
import { prisma } from "../../../utils/prisma";

const confirmPurchaseOrder = async (id: string) => {
  const po = await prisma.purchaseOrder.findUnique({
    where: { id, deletedAt: { isSet: false } },
  });

  if (!po) throw new PurchaseOrderNotFoundError();
  if (po.status !== "SENT")
    throw new PurchaseOrderInvalidStatusTransitionError();

  return await prisma.purchaseOrder.update({
    where: { id },
    data: { status: "CONFIRMED" },
  });
};

export default confirmPurchaseOrder;
