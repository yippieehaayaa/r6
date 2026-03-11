import { prisma } from "../../../utils/prisma";

const getProductVariantSalesSplit = async (productId: string) => {
  const variants = await prisma.productVariant.findMany({
    where: {
      product: { id: productId, deletedAt: { isSet: false } },
      deletedAt: { isSet: false },
    },
    select: { id: true, sku: true, name: true, options: true, price: true },
  });

  if (variants.length === 0) return { productId, variants: [] };

  const variantInfoMap = new Map(variants.map((v) => [v.id, v]));
  const variantIds = variants.map((v) => v.id);

  const movements = await prisma.stockMovement.findMany({
    where: {
      variantId: { in: variantIds },
      type: "SALE",
    },
    select: { quantity: true, variantId: true },
  });

  const statsMap = new Map<
    string,
    { totalUnitsSold: number; revenue: number }
  >();

  for (const m of movements) {
    const info = variantInfoMap.get(m.variantId);
    if (!info) continue;
    const existing = statsMap.get(m.variantId) ?? {
      totalUnitsSold: 0,
      revenue: 0,
    };
    existing.totalUnitsSold += Math.abs(m.quantity);
    existing.revenue += Math.abs(m.quantity) * info.price;
    statsMap.set(m.variantId, existing);
  }

  const result = [...statsMap.entries()]
    .sort((a, b) => b[1].totalUnitsSold - a[1].totalUnitsSold)
    .map(([variantId, stats]) => {
      const info = variantInfoMap.get(variantId);
      return {
        variantId,
        sku: info?.sku,
        name: info?.name,
        options: info?.options,
        ...stats,
      };
    });

  return { productId, variants: result };
};

export default getProductVariantSalesSplit;
