import { prisma } from "../../../utils/prisma";

const getProductSalesByWarehouse = async (productId: string) => {
  const variants = await prisma.productVariant.findMany({
    where: {
      product: { id: productId, deletedAt: { isSet: false } },
      deletedAt: { isSet: false },
    },
    select: { id: true },
  });

  if (variants.length === 0) return { productId, warehouses: [] };

  const variantIds = variants.map((v) => v.id);

  const movements = await prisma.stockMovement.findMany({
    where: {
      variantId: { in: variantIds },
      type: "SALE",
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

  return { productId, warehouses };
};

export default getProductSalesByWarehouse;
