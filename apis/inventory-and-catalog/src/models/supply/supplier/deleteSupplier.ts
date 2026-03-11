import {
  SupplierHasOrdersError,
  SupplierNotFoundError,
} from "../../../utils/errors";
import { prisma } from "../../../utils/prisma";

const deleteSupplier = async (id: string) => {
  const supplier = await prisma.supplier.findUnique({
    where: { id, deletedAt: { isSet: false } },
  });

  if (!supplier) throw new SupplierNotFoundError();

  const orderCount = await prisma.purchaseOrder.count({
    where: { supplierId: id, deletedAt: { isSet: false } },
  });

  if (orderCount > 0) throw new SupplierHasOrdersError();

  return await prisma.supplier.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};

export default deleteSupplier;
