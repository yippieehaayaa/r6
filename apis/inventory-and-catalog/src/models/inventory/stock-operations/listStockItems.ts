import { type Prisma, prisma } from "../../../utils/prisma";

export type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export type ListStockItemsInput = {
  page: number;
  limit: number;
  search?: string;
  warehouseId?: string;
  status?: StockStatus;
};

const buildStatusFilter = (
  tenantSlug: string,
  warehouseId?: string,
  status?: StockStatus,
): Prisma.InputJsonObject | null => {
  if (!status) return null;

  const baseFilter: Prisma.InputJsonObject = {
    tenantSlug,
    ...(warehouseId && { warehouseId: { $oid: warehouseId } }),
  };

  if (status === "IN_STOCK") {
    return {
      ...baseFilter,
      $expr: { $gt: ["$quantityOnHand", "$reorderPoint"] },
    };
  }
  if (status === "LOW_STOCK") {
    return {
      ...baseFilter,
      $expr: {
        $and: [
          { $gt: ["$quantityOnHand", 0] },
          { $lte: ["$quantityOnHand", "$reorderPoint"] },
        ],
      },
    };
  }
  // OUT_OF_STOCK
  return { ...baseFilter, $expr: { $lte: ["$quantityOnHand", 0] } };
};

const listStockItems = async (
  tenantSlug: string,
  input: ListStockItemsInput,
) => {
  const skip = (input.page - 1) * input.limit;

  // When status filter is set, get matching IDs via findRaw (Prisma can't express field comparisons)
  let statusFilteredIds: string[] | undefined;
  if (input.status) {
    const rawFilter = buildStatusFilter(
      tenantSlug,
      input.warehouseId,
      input.status,
    )!;
    const rawResults = (await prisma.inventoryItem.findRaw({
      filter: rawFilter,
      options: { projection: { _id: 1 } },
    })) as unknown as Array<{ _id: { $oid: string } }>;
    statusFilteredIds = rawResults.map((r) => r._id.$oid);
    if (statusFilteredIds.length === 0) {
      return { data: [], total: 0, page: input.page, limit: input.limit };
    }
  }

  const where: Prisma.InventoryItemWhereInput = {
    tenantSlug,
    ...(statusFilteredIds && { id: { in: statusFilteredIds } }),
    ...(!input.status &&
      input.warehouseId && { warehouseId: input.warehouseId }),
    ...(input.search && {
      variant: {
        OR: [
          { name: { contains: input.search, mode: "insensitive" } },
          { sku: { contains: input.search, mode: "insensitive" } },
        ],
      },
    }),
  };

  const [items, total] = await Promise.all([
    prisma.inventoryItem.findMany({
      where,
      include: { variant: true, warehouse: true },
      skip,
      take: input.limit,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.inventoryItem.count({ where }),
  ]);

  const data = items.map(({ variant, warehouse, ...rest }) => ({
    ...rest,
    variantName: variant.name,
    sku: variant.sku,
    warehouseName: warehouse.name,
  }));

  return { data, total, page: input.page, limit: input.limit };
};

export default listStockItems;
