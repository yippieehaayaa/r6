import { toMajorUnits } from "../../../utils/currency";
import { prisma, type Season } from "../../../utils/prisma";
import type { DateRange } from "./types";

const getTopSellingBrands = async (
  limit: number,
  dateRange?: DateRange,
  season?: Season,
) => {
  const effectiveRange = season
    ? { from: season.startDate, to: season.endDate }
    : dateRange;

  const variants = await prisma.productVariant.findMany({
    where: {
      deletedAt: { isSet: false },
      product: { deletedAt: { isSet: false }, brandId: { isSet: true } },
    },
    select: {
      id: true,
      price: true,
      product: {
        select: {
          brand: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (variants.length === 0) return [];

  const variantInfoMap = new Map<
    string,
    { brandId: string; brandName: string; price: number }
  >();

  for (const v of variants) {
    if (!v.product.brand) continue;
    variantInfoMap.set(v.id, {
      brandId: v.product.brand.id,
      brandName: v.product.brand.name,
      price: v.price,
    });
  }

  const variantIds = [...variantInfoMap.keys()];
  if (variantIds.length === 0) return [];

  const movements = await prisma.stockMovement.findMany({
    where: {
      variantId: { in: variantIds },
      type: "SALE",
      ...(effectiveRange && {
        createdAt: { gte: effectiveRange.from, lte: effectiveRange.to },
      }),
    },
    select: { quantity: true, variantId: true },
  });

  const brandMap = new Map<
    string,
    {
      brandId: string;
      brandName: string;
      totalUnitsSold: number;
      revenue: number;
    }
  >();

  for (const m of movements) {
    const info = variantInfoMap.get(m.variantId);
    if (!info) continue;

    const existing = brandMap.get(info.brandId) ?? {
      brandId: info.brandId,
      brandName: info.brandName,
      totalUnitsSold: 0,
      revenue: 0,
    };

    existing.totalUnitsSold += Math.abs(m.quantity);
    existing.revenue += Math.abs(m.quantity) * info.price;
    brandMap.set(info.brandId, existing);
  }

  return [...brandMap.values()]
    .sort((a, b) => b.totalUnitsSold - a.totalUnitsSold)
    .slice(0, limit)
    .map((b) => ({
      ...b,
      revenue: toMajorUnits(b.revenue),
    }));
};

export default getTopSellingBrands;
