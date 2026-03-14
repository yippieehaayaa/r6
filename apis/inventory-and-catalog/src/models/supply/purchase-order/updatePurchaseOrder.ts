import {
  PurchaseOrderInvalidStatusTransitionError,
  PurchaseOrderNotFoundError,
  PurchaseOrderNumberExistsError,
} from "../../../utils/errors";
import { prisma } from "../../../utils/prisma";

export type UpdatePurchaseOrderInput = {
  orderNumber?: string;
  expectedAt?: Date;
  notes?: string;
};

const updatePurchaseOrder = async (
  id: string,
  input: UpdatePurchaseOrderInput,
) => {
  const po = await prisma.purchaseOrder.findUnique({
    where: { id, deletedAt: { isSet: false } },
  });

  if (!po) throw new PurchaseOrderNotFoundError();
  if (po.status !== "DRAFT")
    throw new PurchaseOrderInvalidStatusTransitionError();

  try {
    return await prisma.purchaseOrder.update({
      where: { id },
      data: input,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      throw new PurchaseOrderNumberExistsError();
    }
    throw error;
  }
};

export default updatePurchaseOrder;
