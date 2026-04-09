import { toMajorUnits } from "../../../utils/currency";
import { prisma } from "../../../utils/prisma";
import type { DateRange } from "./types";

const getTopSellingProducts = async (
  tenantSlug: string,
  limit: number,
  dateRange?: DateRange,
  warehouseId?: string,
) => {
  const variants = await prisma.productVariant.findMany({
    where: {
      tenantSlug,
      deletedAt: { isSet: false },
      product: { deletedAt: { isSet: false } },
    },
    select: {
      id: true,
      price: true,
      product: { select: { id: true, sku: true, name: true, slug: true } },
    },
  });

  if (variants.length === 0) return [];

  const variantInfoMap = new Map(
    variants
      .map((v) => ({
        id: v.id,
        productId: v.product.id,
        productSku: v.product.sku,
        productName: v.product.name,
        productSlug: v.product.slug,
        price: v.price,
      }))
      .map((v) => [v.id, v]),
  );

  const variantIds = [...variantInfoMap.keys()];

  const movements = await prisma.stockMovement.findMany({
    where: {
      tenantSlug,
      variantId: { in: variantIds },
      type: "SALE",
      ...(warehouseId && { warehouseId }),
      ...(dateRange && {
        createdAt: { gte: dateRange.from, lte: dateRange.to },
      }),
    },
    select: { quantity: true, variantId: true },
  });

  const productMap = new Map<
    string,
    {
      productId: string;
      sku: string;
      name: string;
      slug: string;
      totalUnitsSold: number;
      revenue: number;
    }
  >();

  for (const m of movements) {
    const info = variantInfoMap.get(m.variantId);
    if (!info) continue;

    const existing = productMap.get(info.productId) ?? {
      productId: info.productId,
      sku: info.productSku,
      name: info.productName,
      slug: info.productSlug,
      totalUnitsSold: 0,
      revenue: 0,
    };

    existing.totalUnitsSold += Math.abs(m.quantity);
    existing.revenue += Math.abs(m.quantity) * info.price;
    productMap.set(info.productId, existing);
  }

  return [...productMap.values()]
    .sort((a, b) => b.totalUnitsSold - a.totalUnitsSold)
    .slice(0, limit)
    .map((p) => ({
      ...p,
      revenue: toMajorUnits(p.revenue),
    }));
};

export default getTopSellingProducts;
