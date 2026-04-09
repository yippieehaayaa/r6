import { ProductVariantNotFoundError } from "../../../utils/errors";
import { prisma } from "../../../utils/prisma";

const getVariantById = async (tenantSlug: string, id: string) => {
  const variant = await prisma.productVariant.findUnique({
    where: { id, tenantSlug, deletedAt: { isSet: false } },
  });

  if (!variant) throw new ProductVariantNotFoundError();

  return variant;
};

export default getVariantById;
