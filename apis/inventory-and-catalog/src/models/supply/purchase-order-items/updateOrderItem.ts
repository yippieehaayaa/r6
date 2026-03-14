import { toMinorUnits } from "../../../utils/currency";
import {
  PurchaseOrderInvalidStatusTransitionError,
  PurchaseOrderItemNotFoundError,
  PurchaseOrderNotFoundError,
} from "../../../utils/errors";
import { prisma } from "../../../utils/prisma";

export type UpdateOrderItemInput = {
  quantityOrdered?: number;
  unitCost?: number;
};

const updateOrderItem = async (
  purchaseOrderId: string,
  variantId: string,
  input: UpdateOrderItemInput,
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

  const { unitCost, ...rest } = input;

  return await prisma.purchaseOrderItem.update({
    where: { purchaseOrderId_variantId: { purchaseOrderId, variantId } },
    data: {
      ...rest,
      ...(unitCost !== undefined && { unitCost: toMinorUnits(unitCost) }),
    },
  });
};

export default updateOrderItem;
