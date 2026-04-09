import {
  PurchaseOrderInvalidStatusTransitionError,
  PurchaseOrderItemNotFoundError,
  PurchaseOrderNotFoundError,
} from "../../../utils/errors";
import { prisma } from "../../../utils/prisma";
import receiveGoods from "../../inventory/stock-operations/receiveGoods";

export type ReceiptItem = {
  variantId: string;
  quantityReceived: number;
};

const receivePurchaseOrder = async (
  tenantSlug: string,
  id: string,
  receipts: ReceiptItem[],
  performedBy: string,
) => {
  return await prisma.$transaction(async (tx) => {
    const po = await tx.purchaseOrder.findUnique({
      where: { id, tenantSlug, deletedAt: { isSet: false } },
      include: { items: true },
    });

    if (!po) throw new PurchaseOrderNotFoundError();

    if (po.status !== "CONFIRMED" && po.status !== "PARTIALLY_RECEIVED") {
      throw new PurchaseOrderInvalidStatusTransitionError();
    }

    const results = await Promise.all(
      receipts.map(async (receipt) => {
        const lineItem = po.items.find(
          (i) => i.variantId === receipt.variantId,
        );
        if (!lineItem) throw new PurchaseOrderItemNotFoundError();

        const updatedItem = await tx.purchaseOrderItem.update({
          where: {
            tenantSlug_purchaseOrderId_variantId: {
              tenantSlug,
              purchaseOrderId: id,
              variantId: receipt.variantId,
            },
          },
          data: { quantityReceived: { increment: receipt.quantityReceived } },
        });

        const { inventoryItem, movement } = await receiveGoods(tenantSlug, tx, {
          variantId: receipt.variantId,
          warehouseId: po.warehouseId,
          quantity: receipt.quantityReceived,
          referenceId: id,
          referenceType: "PURCHASE_ORDER",
          performedBy,
        });

        return { updatedItem, inventoryItem, movement };
      }),
    );

    const allItems = await tx.purchaseOrderItem.findMany({
      where: { purchaseOrderId: id },
    });

    const fullyReceived = allItems.every(
      (i) => i.quantityReceived >= i.quantityOrdered,
    );

    const updatedPo = await tx.purchaseOrder.update({
      where: { id },
      data: { status: fullyReceived ? "RECEIVED" : "PARTIALLY_RECEIVED" },
    });

    return { purchaseOrder: updatedPo, receipts: results };
  });
};

export default receivePurchaseOrder;
