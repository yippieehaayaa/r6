import { toMinorUnits } from "../../../utils/currency";
import {
  ProductVariantNotFoundError,
  PurchaseOrderInvalidStatusTransitionError,
  PurchaseOrderItemDuplicateVariantError,
  PurchaseOrderNotFoundError,
} from "../../../utils/errors";
import { prisma } from "../../../utils/prisma";

export type AddItemToOrderInput = {
  variantId: string;
  quantityOrdered: number;
  unitCost: number;
};

const addItemToOrder = async (
  tenantSlug: string,
  purchaseOrderId: string,
  input: AddItemToOrderInput,
) => {
  const po = await prisma.purchaseOrder.findUnique({
    where: { id: purchaseOrderId, tenantSlug, deletedAt: { isSet: false } },
  });

  if (!po) throw new PurchaseOrderNotFoundError();
  if (po.status !== "DRAFT")
    throw new PurchaseOrderInvalidStatusTransitionError();

  const variant = await prisma.productVariant.findUnique({
    where: { id: input.variantId, deletedAt: { isSet: false } },
  });

  if (!variant) throw new ProductVariantNotFoundError();

  try {
    return await prisma.purchaseOrderItem.create({
      data: {
        tenantSlug,
        purchaseOrderId,
        variantId: input.variantId,
        quantityOrdered: input.quantityOrdered,
        unitCost: toMinorUnits(input.unitCost),
      },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      throw new PurchaseOrderItemDuplicateVariantError();
    }
    throw error;
  }
};

export default addItemToOrder;
