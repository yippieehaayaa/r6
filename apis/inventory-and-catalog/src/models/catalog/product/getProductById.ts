import { ProductNotFoundError } from "../../../utils/errors";
import { prisma } from "../../../utils/prisma";

const getProductById = async (tenantSlug: string, id: string) => {
  const product = await prisma.product.findUnique({
    where: { id, tenantSlug, deletedAt: { isSet: false } },
    include: {
      variants: { where: { deletedAt: { isSet: false } } },
    },
  });

  if (!product) throw new ProductNotFoundError();

  return product;
};

export default getProductById;
