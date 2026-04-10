import { toMajorUnits } from "../../../utils/currency";
import { prisma } from "../../../utils/prisma";
import type { DateRange } from "./types";

const getProductRevenueByBrand = async (
  tenantSlug: string,
  brandId: string,
  dateRange?: DateRange,
) => {
  const products = await prisma.product.findMany({
    where: { tenantSlug, brandId, deletedAt: { isSet: false } },
    select: {
      id: true,
      sku: true,
      name: true,
      slug: true,
      variants: {
        where: { deletedAt: { isSet: false } },
        select: { id: true, price: true },
      },
    },
  });

  if (products.length === 0) return { brandId, products: [] };

  const variantToProductId = new Map<string, string>();
  const variantPriceMap = new Map<string, number>();

  for (const product of products) {
    for (const variant of product.variants) {
      variantToProductId.set(variant.id, product.id);
      variantPriceMap.set(variant.id, variant.price);
    }
  }

  const variantIds = [...variantToProductId.keys()];
  if (variantIds.length === 0) return { brandId, products: [] };

  const movements = await prisma.stockMovement.findMany({
    where: {
      tenantSlug,
      variantId: { in: variantIds },
      type: "SALE",
      ...(dateRange && {
        createdAt: { gte: dateRange.from, lte: dateRange.to },
      }),
    },
    select: { quantity: true, variantId: true },
  });

  const productStatsMap = new Map<
    string,
    { totalUnitsSold: number; revenue: number }
  >();

  for (const m of movements) {
    const productId = variantToProductId.get(m.variantId);
    if (!productId) continue;
    const price = variantPriceMap.get(m.variantId) ?? 0;
    const existing = productStatsMap.get(productId) ?? {
      totalUnitsSold: 0,
      revenue: 0,
    };
    existing.totalUnitsSold += Math.abs(m.quantity);
    existing.revenue += Math.abs(m.quantity) * price;
    productStatsMap.set(productId, existing);
  }

  const productInfoMap = new Map(products.map((p) => [p.id, p]));

  return {
    brandId,
    products: [...productStatsMap.entries()]
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .map(([productId, stats]) => {
        const info = productInfoMap.get(productId);
        return {
          productId,
          sku: info?.sku,
          name: info?.name,
          slug: info?.slug,
          ...stats,
          revenue: toMajorUnits(stats.revenue),
        };
      }),
  };
};

export default getProductRevenueByBrand;
