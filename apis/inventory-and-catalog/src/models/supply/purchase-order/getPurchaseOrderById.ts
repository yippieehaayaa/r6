import { PurchaseOrderNotFoundError } from "../../../utils/errors";
import { prisma } from "../../../utils/prisma";

const getPurchaseOrderById = async (id: string) => {
  const po = await prisma.purchaseOrder.findUnique({
    where: { id, deletedAt: { isSet: false } },
    include: { items: true, supplier: true, warehouse: true },
  });

  if (!po) throw new PurchaseOrderNotFoundError();

  return po;
};

export default getPurchaseOrderById;
