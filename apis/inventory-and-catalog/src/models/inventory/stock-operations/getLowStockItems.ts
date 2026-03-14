import { type Prisma, prisma } from "../../../utils/prisma";

const getLowStockItems = async (warehouseId?: string) => {
  const filter: Prisma.InputJsonObject = {
    $expr: { $lte: ["$quantityOnHand", "$reorderPoint"] },
    ...(warehouseId && { warehouseId: { $oid: warehouseId } }),
  };

  const rawResults = (await prisma.inventoryItem.findRaw({
    filter,
    options: { projection: { _id: 1 } },
  })) as unknown as Array<{ _id: { $oid: string } }>;

  if (rawResults.length === 0) return [];

  const ids = rawResults.map((r) => r._id.$oid);

  return prisma.inventoryItem.findMany({
    where: { id: { in: ids } },
    include: { variant: true, warehouse: true },
  });
};

export default getLowStockItems;
