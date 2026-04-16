import { type Prisma, prisma } from "../../../utils/prisma";

type AggregateResult = Array<{
  _id: null;
  totalOnHand: number;
  totalReserved: number;
}>;

const getStockCounts = async (tenantSlug: string, warehouseId?: string) => {
  const baseWhere: Prisma.InventoryItemWhereInput = {
    tenantSlug,
    ...(warehouseId && { warehouseId }),
  };

  const matchStage: Prisma.InputJsonObject = {
    tenantSlug,
    ...(warehouseId && { warehouseId: { $oid: warehouseId } }),
  };

  const inStockFilter: Prisma.InputJsonObject = {
    $expr: { $gt: ["$quantityOnHand", "$reorderPoint"] },
    ...matchStage,
  };

  const [total, outOfStock, inStockRaw, volumeRaw] = await Promise.all([
    prisma.inventoryItem.count({ where: baseWhere }),
    prisma.inventoryItem.count({ where: { ...baseWhere, quantityOnHand: 0 } }),
    prisma.inventoryItem.findRaw({
      filter: inStockFilter,
      options: { projection: { _id: 1 } },
    }) as unknown as Promise<Array<{ _id: { $oid: string } }>>,
    prisma.inventoryItem.aggregateRaw({
      pipeline: [
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalOnHand: { $sum: "$quantityOnHand" },
            totalReserved: { $sum: "$quantityReserved" },
          },
        },
      ],
    }) as unknown as Promise<AggregateResult>,
  ]);

  const inStock = inStockRaw.length;
  const lowStock = Math.max(0, total - outOfStock - inStock);
  const totalUnitsOnHand = volumeRaw[0]?.totalOnHand ?? 0;
  const totalUnitsReserved = volumeRaw[0]?.totalReserved ?? 0;
  const totalUnitsAvailable = totalUnitsOnHand - totalUnitsReserved;

  return {
    total,
    inStock,
    lowStock,
    outOfStock,
    totalUnitsOnHand,
    totalUnitsReserved,
    totalUnitsAvailable,
  };
};

export default getStockCounts;
