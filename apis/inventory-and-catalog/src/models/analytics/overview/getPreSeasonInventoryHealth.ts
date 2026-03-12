import { prisma, type Season } from "../../../utils/prisma";

const shiftYearBack = (date: Date): Date => {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() - 1);
  return d;
};

const getPreSeasonInventoryHealth = async (season: Season) => {
  const prevYearStart = shiftYearBack(season.startDate);
  const prevYearEnd = shiftYearBack(season.endDate);

  const [inventoryItems, lastSeasonMovements] = await Promise.all([
    prisma.inventoryItem.findMany({
      where: {
        variant: { deletedAt: { isSet: false } },
      },
      select: {
        variantId: true,
        warehouseId: true,
        quantityOnHand: true,
        quantityReserved: true,
        reorderPoint: true,
        variant: {
          select: {
            sku: true,
            name: true,
            product: { select: { id: true, sku: true, name: true } },
          },
        },
      },
    }),
    prisma.stockMovement.findMany({
      where: {
        type: "SALE",
        createdAt: { gte: prevYearStart, lte: prevYearEnd },
      },
      select: { variantId: true, warehouseId: true, quantity: true },
    }),
  ]);

  const soldMap = new Map<string, number>();
  for (const m of lastSeasonMovements) {
    const key = `${m.variantId}:${m.warehouseId}`;
    soldMap.set(key, (soldMap.get(key) ?? 0) + Math.abs(m.quantity));
  }

  type ItemResult = {
    variantId: string;
    variantSku: string;
    variantName: string;
    productId: string;
    productSku: string;
    productName: string;
    quantityOnHand: number;
    quantityReserved: number;
    available: number;
    projectedDemand: number;
    coverageRatio: number | null;
    isUnderstocked: boolean;
  };

  const warehouseMap = new Map<
    string,
    { warehouseId: string; items: ItemResult[] }
  >();

  for (const item of inventoryItems) {
    const key = `${item.variantId}:${item.warehouseId}`;
    const projectedDemand = soldMap.get(key) ?? 0;
    const available = item.quantityOnHand - item.quantityReserved;
    const coverageRatio =
      projectedDemand > 0 ? available / projectedDemand : null;
    const isUnderstocked =
      projectedDemand > 0
        ? available < projectedDemand
        : available <= item.reorderPoint;

    const entry: ItemResult = {
      variantId: item.variantId,
      variantSku: item.variant.sku,
      variantName: item.variant.name,
      productId: item.variant.product.id,
      productSku: item.variant.product.sku,
      productName: item.variant.product.name,
      quantityOnHand: item.quantityOnHand,
      quantityReserved: item.quantityReserved,
      available,
      projectedDemand,
      coverageRatio,
      isUnderstocked,
    };

    const existing = warehouseMap.get(item.warehouseId) ?? {
      warehouseId: item.warehouseId,
      items: [],
    };
    existing.items.push(entry);
    warehouseMap.set(item.warehouseId, existing);
  }

  return [...warehouseMap.values()].map((w) => ({
    warehouseId: w.warehouseId,
    totalVariants: w.items.length,
    understockedCount: w.items.filter((i) => i.isUnderstocked).length,
    items: w.items,
  }));
};

export default getPreSeasonInventoryHealth;
