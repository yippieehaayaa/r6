import { prisma } from "../../../utils/prisma";

const getStockForProduct = async (productId: string) => {
  const variants = await prisma.productVariant.findMany({
    where: { productId, deletedAt: { isSet: false } },
    select: { id: true },
  });

  const variantIds = variants.map((v) => v.id);

  const items = await prisma.inventoryItem.findMany({
    where: { variantId: { in: variantIds } },
    include: { variant: true, warehouse: true },
  });

  const totalOnHand = items.reduce((sum, i) => sum + i.quantityOnHand, 0);
  const totalReserved = items.reduce((sum, i) => sum + i.quantityReserved, 0);

  return { totalOnHand, totalReserved, items };
};

export default getStockForProduct;
