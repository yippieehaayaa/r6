import {
  type Prisma,
  type PurchaseOrderStatus,
  prisma,
} from "../../../utils/prisma";

export type ListPurchaseOrdersInput = {
  page: number;
  limit: number;
  supplierId?: string;
  warehouseId?: string;
  status?: PurchaseOrderStatus;
  from?: Date;
  to?: Date;
};

const buildWhere = (
  input: Omit<ListPurchaseOrdersInput, "page" | "limit">,
): Prisma.PurchaseOrderWhereInput => ({
  deletedAt: { isSet: false },
  ...(input.supplierId !== undefined && { supplierId: input.supplierId }),
  ...(input.warehouseId !== undefined && { warehouseId: input.warehouseId }),
  ...(input.status !== undefined && { status: input.status }),
  ...((input.from !== undefined || input.to !== undefined) && {
    createdAt: {
      ...(input.from !== undefined && { gte: input.from }),
      ...(input.to !== undefined && { lte: input.to }),
    },
  }),
});

const listPurchaseOrders = async (input: ListPurchaseOrdersInput) => {
  const where = buildWhere(input);
  const skip = (input.page - 1) * input.limit;

  const [data, total] = await Promise.all([
    prisma.purchaseOrder.findMany({
      where,
      skip,
      take: input.limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.purchaseOrder.count({ where }),
  ]);

  return { data, total, page: input.page, limit: input.limit };
};

export default listPurchaseOrders;
