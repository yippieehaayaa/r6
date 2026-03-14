import {
  SupplierCodeExistsError,
  SupplierNameExistsError,
  SupplierNotFoundError,
} from "../../../utils/errors";
import { type AddressEmbed, prisma } from "../../../utils/prisma";

export type UpdateSupplierInput = {
  name?: string;
  code?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: AddressEmbed;
  isActive?: boolean;
};

const updateSupplier = async (id: string, input: UpdateSupplierInput) => {
  const supplier = await prisma.supplier.findUnique({
    where: { id, deletedAt: { isSet: false } },
  });

  if (!supplier) throw new SupplierNotFoundError();

  const { address, ...rest } = input;

  try {
    return await prisma.supplier.update({
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
      if (target?.includes("code")) throw new SupplierCodeExistsError();
      throw new SupplierNameExistsError();
    }
    throw error;
  }
};

export default updateSupplier;
