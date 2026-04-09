import { type Prisma, prisma } from "../../../utils/prisma";

const getStockCounts = async (tenantSlug: string, warehouseId?: string) => {
  const baseWhere: Prisma.InventoryItemWhereInput = {
    tenantSlug,
    ...(warehouseId && { warehouseId }),
  };

  const inStockFilter: Prisma.InputJsonObject = {
    $expr: { $gt: ["$quantityOnHand", "$reorderPoint"] },
    tenantSlug,
    ...(warehouseId && { warehouseId: { $oid: warehouseId } }),
  };

  const [total, outOfStock, inStockRaw] = await Promise.all([
    prisma.inventoryItem.count({ where: baseWhere }),
    prisma.inventoryItem.count({ where: { ...baseWhere, quantityOnHand: 0 } }),
    prisma.inventoryItem.findRaw({
      filter: inStockFilter,
      options: { projection: { _id: 1 } },
    }) as unknown as Promise<Array<{ _id: { $oid: string } }>>,
  ]);

  const inStock = inStockRaw.length;
  const lowStock = Math.max(0, total - outOfStock - inStock);

  return { total, inStock, lowStock, outOfStock };
};

export default getStockCounts;
