import { SupplierNotFoundError } from "../../../utils/errors";
import { prisma } from "../../../utils/prisma";

const getSupplierById = async (id: string) => {
  const supplier = await prisma.supplier.findUnique({
    where: { id, deletedAt: { isSet: false } },
  });

  if (!supplier) throw new SupplierNotFoundError();

  return supplier;
};

export default getSupplierById;
