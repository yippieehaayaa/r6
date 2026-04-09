import { prisma, type Season } from "../../../utils/prisma";

const getBrandTopWarehouseForSales = async (
  tenantSlug: string,
  brandId: string,
  season?: Season,
) => {
  const variants = await prisma.productVariant.findMany({
    where: {
      tenantSlug,
      product: { brandId, deletedAt: { isSet: false } },
      deletedAt: { isSet: false },
    },
    select: { id: true },
  });

  if (variants.length === 0) {
    return { brandId, season: season?.name, warehouses: [] };
  }

  const variantIds = variants.map((v) => v.id);

  const movements = await prisma.stockMovement.findMany({
    where: {
      tenantSlug,
      variantId: { in: variantIds },
      type: "SALE",
      ...(season && {
        createdAt: { gte: season.startDate, lte: season.endDate },
      }),
    },
    select: {
      quantity: true,
      warehouseId: true,
      warehouse: { select: { name: true, code: true } },
    },
  });

  const warehouseMap = new Map<
    string,
    { warehouseId: string; name: string; code: string; totalUnitsSold: number }
  >();

  for (const m of movements) {
    const existing = warehouseMap.get(m.warehouseId) ?? {
      warehouseId: m.warehouseId,
      name: m.warehouse.name,
      code: m.warehouse.code,
      totalUnitsSold: 0,
    };
    existing.totalUnitsSold += Math.abs(m.quantity);
    warehouseMap.set(m.warehouseId, existing);
  }

  const warehouses = [...warehouseMap.values()].sort(
    (a, b) => b.totalUnitsSold - a.totalUnitsSold,
  );

  return { brandId, season: season?.name, warehouses };
};

export default getBrandTopWarehouseForSales;
