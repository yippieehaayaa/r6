import { ProductVariantNotFoundError } from "../../../utils/errors";
import { prisma } from "../../../utils/prisma";

const getVariantById = async (id: string) => {
  const variant = await prisma.productVariant.findUnique({
    where: { id, deletedAt: { isSet: false } },
  });

  if (!variant) throw new ProductVariantNotFoundError();

  return variant;
};

export default getVariantById;
