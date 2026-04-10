import { type Prisma, prisma } from "../../../utils/prisma";

const getLowStockItems = async (tenantSlug: string, warehouseId?: string) => {
  const filter: Prisma.InputJsonObject = {
    $expr: {
      $and: [
        { $gt: ["$quantityOnHand", 0] },
        { $lte: ["$quantityOnHand", "$reorderPoint"] },
      ],
    },
    tenantSlug,
    ...(warehouseId && { warehouseId: { $oid: warehouseId } }),
  };

  const rawResults = (await prisma.inventoryItem.findRaw({
    filter,
    options: { projection: { _id: 1 } },
  })) as unknown as Array<{ _id: { $oid: string } }>;

  if (rawResults.length === 0) return [];

  const ids = rawResults.map((r) => r._id.$oid);

  const items = await prisma.inventoryItem.findMany({
    where: { tenantSlug, id: { in: ids } },
    include: { variant: true, warehouse: true },
  });

  return items.map(({ variant, warehouse, ...rest }) => ({
    ...rest,
    variantName: variant.name,
    sku: variant.sku,
    warehouseName: warehouse.name,
  }));
};

export default getLowStockItems;
