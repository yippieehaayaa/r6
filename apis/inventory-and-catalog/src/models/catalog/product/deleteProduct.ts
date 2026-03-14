import { ProductNotFoundError } from "../../../utils/errors";
import { prisma } from "../../../utils/prisma";

const deleteProduct = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id, deletedAt: { isSet: false } },
  });

  if (!product) throw new ProductNotFoundError();

  const now = new Date();

  const [deleted] = await Promise.all([
    prisma.product.update({
      where: { id },
      data: { deletedAt: now },
    }),
    prisma.productVariant.updateMany({
      where: { productId: id, deletedAt: { isSet: false } },
      data: { deletedAt: now },
    }),
  ]);

  return deleted;
};

export default deleteProduct;
