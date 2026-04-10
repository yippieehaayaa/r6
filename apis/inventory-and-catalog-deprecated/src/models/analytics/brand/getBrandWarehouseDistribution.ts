import { prisma } from "../../../utils/prisma";

const getBrandWarehouseDistribution = async (
  tenantSlug: string,
  brandId: string,
) => {
  const variants = await prisma.productVariant.findMany({
    where: {
      tenantSlug,
      product: { brandId, deletedAt: { isSet: false } },
      deletedAt: { isSet: false },
    },
    select: { id: true },
  });

  if (variants.length === 0) return { brandId, warehouses: [] };

  const variantIds = variants.map((v) => v.id);

  const items = await prisma.inventoryItem.findMany({
    where: {
      tenantSlug,
      variantId: { in: variantIds },
      warehouse: { deletedAt: { isSet: false }, isActive: true },
    },
    select: {
      quantityOnHand: true,
      warehouseId: true,
      warehouse: { select: { name: true, code: true } },
    },
  });

  const warehouseMap = new Map<
    string,
    { warehouseId: string; name: string; code: string; quantityOnHand: number }
  >();

  for (const item of items) {
    const existing = warehouseMap.get(item.warehouseId) ?? {
      warehouseId: item.warehouseId,
      name: item.warehouse.name,
      code: item.warehouse.code,
      quantityOnHand: 0,
    };
    existing.quantityOnHand += item.quantityOnHand;
    warehouseMap.set(item.warehouseId, existing);
  }

  const warehouses = [...warehouseMap.values()].sort(
    (a, b) => b.quantityOnHand - a.quantityOnHand,
  );

  return { brandId, warehouses };
};

export default getBrandWarehouseDistribution;
