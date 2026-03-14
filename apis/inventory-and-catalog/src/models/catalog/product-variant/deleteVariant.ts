import { ProductVariantNotFoundError } from "../../../utils/errors";
import { prisma } from "../../../utils/prisma";

const deleteVariant = async (id: string) => {
  const variant = await prisma.productVariant.findUnique({
    where: { id, deletedAt: { isSet: false } },
  });

  if (!variant) throw new ProductVariantNotFoundError();

  return await prisma.productVariant.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};

export default deleteVariant;
