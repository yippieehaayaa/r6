import { SupplierNotFoundError } from "../../../utils/errors";
import { prisma } from "../../../utils/prisma";

const getSupplierById = async (tenantSlug: string, id: string) => {
  const supplier = await prisma.supplier.findUnique({
    where: { id, tenantSlug, deletedAt: { isSet: false } },
  });

  if (!supplier) throw new SupplierNotFoundError();

  return supplier;
};

export default getSupplierById;
