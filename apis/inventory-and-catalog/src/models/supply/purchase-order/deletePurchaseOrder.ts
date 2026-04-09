import {
  PurchaseOrderInvalidStatusTransitionError,
  PurchaseOrderNotFoundError,
} from "../../../utils/errors";
import { prisma } from "../../../utils/prisma";

const deletePurchaseOrder = async (tenantSlug: string, id: string) => {
  const po = await prisma.purchaseOrder.findUnique({
    where: { id, tenantSlug, deletedAt: { isSet: false } },
  });

  if (!po) throw new PurchaseOrderNotFoundError();

  if (po.status !== "DRAFT" && po.status !== "CANCELLED") {
    throw new PurchaseOrderInvalidStatusTransitionError();
  }

  return await prisma.purchaseOrder.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};

export default deletePurchaseOrder;
