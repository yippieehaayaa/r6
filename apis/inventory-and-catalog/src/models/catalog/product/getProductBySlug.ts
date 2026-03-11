import { ProductNotFoundError } from "../../../utils/errors";
import { prisma } from "../../../utils/prisma";

const getProductBySlug = async (slug: string) => {
  const product = await prisma.product.findUnique({
    where: { slug, deletedAt: { isSet: false }, isActive: true },
    include: {
      variants: { where: { deletedAt: { isSet: false }, isActive: true } },
    },
  });

  if (!product) throw new ProductNotFoundError();

  return product;
};

export default getProductBySlug;
