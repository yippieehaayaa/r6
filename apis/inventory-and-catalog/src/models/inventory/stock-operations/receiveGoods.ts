import type { TransactionClient } from "../../../utils/prisma";

export type ReceiveGoodsInput = {
  variantId: string;
  warehouseId: string;
  quantity: number;
  referenceId: string;
  referenceType: string;
  performedBy: string;
};

const receiveGoods = async (
  tx: TransactionClient,
  input: ReceiveGoodsInput,
) => {
  const inventoryItem = await tx.inventoryItem.upsert({
    where: {
      variantId_warehouseId: {
        variantId: input.variantId,
        warehouseId: input.warehouseId,
      },
    },
    update: { quantityOnHand: { increment: input.quantity } },
    create: {
      variantId: input.variantId,
      warehouseId: input.warehouseId,
      quantityOnHand: input.quantity,
    },
  });

  const movement = await tx.stockMovement.create({
    data: {
      type: "RECEIPT",
      quantity: input.quantity,
      referenceId: input.referenceId,
      referenceType: input.referenceType,
      variantId: input.variantId,
      warehouseId: input.warehouseId,
      performedBy: input.performedBy,
    },
  });

  return { inventoryItem, movement };
};

export default receiveGoods;
