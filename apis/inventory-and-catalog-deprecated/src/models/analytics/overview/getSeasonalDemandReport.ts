import { toMajorUnits } from "../../../utils/currency";
import { prisma, type Season } from "../../../utils/prisma";

const applyYear = (date: Date, year: number): Date => {
  const d = new Date(date);
  d.setFullYear(year);
  return d;
};

const getSeasonalDemandReport = async (
  tenantSlug: string,
  season: Season,
  limit: number,
  year?: number,
) => {
  const startDate = year ? applyYear(season.startDate, year) : season.startDate;
  const endDate = year ? applyYear(season.endDate, year) : season.endDate;

  const movements = await prisma.stockMovement.findMany({
    where: {
      tenantSlug,
      type: "SALE",
      createdAt: { gte: startDate, lte: endDate },
    },
    select: {
      quantity: true,
      variantId: true,
      variant: {
        select: {
          price: true,
          product: {
            select: {
              id: true,
              sku: true,
              name: true,
              brand: { select: { id: true, name: true } },
            },
          },
        },
      },
    },
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

  const productMap = new Map<
    string,
    {
      productId: string;
      productSku: string;
      productName: string;
      totalUnitsSold: number;
      revenue: number;
    }
  >();

  for (const m of movements) {
    const units = Math.abs(m.quantity);
    const revenue = units * m.variant.price;
    const { product } = m.variant;

    const existing = productMap.get(product.id) ?? {
      productId: product.id,
      productSku: product.sku,
      productName: product.name,
      totalUnitsSold: 0,
      revenue: 0,
    };
    existing.totalUnitsSold += units;
    existing.revenue += revenue;
    productMap.set(product.id, existing);

    if (!product.brand) continue;

    const existingBrand = brandMap.get(product.brand.id) ?? {
      brandId: product.brand.id,
      brandName: product.brand.name,
      totalUnitsSold: 0,
      revenue: 0,
    };
    existingBrand.totalUnitsSold += units;
    existingBrand.revenue += revenue;
    brandMap.set(product.brand.id, existingBrand);
  }

  const sort = <T extends { totalUnitsSold: number }>(arr: T[]) =>
    arr.sort((a, b) => b.totalUnitsSold - a.totalUnitsSold).slice(0, limit);

  return {
    seasonName: season.name,
    dateRange: { from: startDate, to: endDate },
    topBrands: sort([...brandMap.values()]).map((b) => ({
      ...b,
      revenue: toMajorUnits(b.revenue),
    })),
    topProducts: sort([...productMap.values()]).map((p) => ({
      ...p,
      revenue: toMajorUnits(p.revenue),
    })),
  };
};

export default getSeasonalDemandReport;
