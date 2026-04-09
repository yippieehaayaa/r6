import {
  WarehouseHasInventoryError,
  WarehouseNotFoundError,
} from "../../../utils/errors";
import { prisma } from "../../../utils/prisma";

const deleteWarehouse = async (tenantSlug: string, id: string) => {
  const warehouse = await prisma.warehouse.findUnique({
    where: { id, tenantSlug, deletedAt: { isSet: false } },
  });

  if (!warehouse) throw new WarehouseNotFoundError();

  const itemCount = await prisma.inventoryItem.count({
    where: { tenantSlug, warehouseId: id },
  });

  if (itemCount > 0) throw new WarehouseHasInventoryError();

  return await prisma.warehouse.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};

export default deleteWarehouse;
