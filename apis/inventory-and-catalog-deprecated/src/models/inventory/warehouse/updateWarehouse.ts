import {
  WarehouseCodeExistsError,
  WarehouseNameExistsError,
  WarehouseNotFoundError,
} from "../../../utils/errors";
import { type AddressEmbed, prisma } from "../../../utils/prisma";

export type UpdateWarehouseInput = {
  name?: string;
  code?: string;
  address?: AddressEmbed;
  isActive?: boolean;
};

const updateWarehouse = async (
  tenantSlug: string,
  id: string,
  input: UpdateWarehouseInput,
) => {
  const warehouse = await prisma.warehouse.findUnique({
    where: { id, tenantSlug, deletedAt: { isSet: false } },
  });

  if (!warehouse) throw new WarehouseNotFoundError();

  const { address, ...rest } = input;

  try {
    return await prisma.warehouse.update({
      where: { id },
      data: {
        ...rest,
        ...(address !== undefined && { address: { set: address } }),
      },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      const target = (error as { meta?: { target?: string[] } }).meta?.target;
      if (target?.includes("code")) throw new WarehouseCodeExistsError();
      throw new WarehouseNameExistsError();
    }
    throw error;
  }
};

export default updateWarehouse;
