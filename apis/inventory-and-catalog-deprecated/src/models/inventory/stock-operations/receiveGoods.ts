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
  tenantSlug: string,
  tx: TransactionClient,
  input: ReceiveGoodsInput,
) => {
  const inventoryItem = await tx.inventoryItem.upsert({
    where: {
      tenantSlug_variantId_warehouseId: {
        tenantSlug,
        variantId: input.variantId,
        warehouseId: input.warehouseId,
      },
    },
    update: { quantityOnHand: { increment: input.quantity } },
    create: {
      tenantSlug,
      variantId: input.variantId,
      warehouseId: input.warehouseId,
      quantityOnHand: input.quantity,
    },
  });

  const movement = await tx.stockMovement.create({
    data: {
      tenantSlug,
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
