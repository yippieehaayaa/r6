import { WarehouseNotFoundError } from "../../../utils/errors";
import { prisma } from "../../../utils/prisma";

const getWarehouseById = async (tenantSlug: string, id: string) => {
  const warehouse = await prisma.warehouse.findUnique({
    where: { id, tenantSlug, deletedAt: { isSet: false } },
  });

  if (!warehouse) throw new WarehouseNotFoundError();

  return warehouse;
};

export default getWarehouseById;
