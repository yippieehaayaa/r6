import { ProductNotFoundError } from "../../../utils/errors";
import { prisma } from "../../../utils/prisma";

const getProductBySlug = async (tenantSlug: string, slug: string) => {
  const product = await prisma.product.findUnique({
    where: {
      tenantSlug_slug: { tenantSlug, slug },
      deletedAt: { isSet: false },
      status: "ACTIVE",
    },
    include: {
      variants: { where: { deletedAt: { isSet: false }, isActive: true } },
    },
  });

  if (!product) throw new ProductNotFoundError();

  return product;
};

export default getProductBySlug;
