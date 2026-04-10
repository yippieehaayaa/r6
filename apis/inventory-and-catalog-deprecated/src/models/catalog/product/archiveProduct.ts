import {
  ProductInvalidStatusTransitionError,
  ProductNotFoundError,
} from "../../../utils/errors";
import { prisma } from "../../../utils/prisma";

const archiveProduct = async (tenantSlug: string, id: string) => {
  const product = await prisma.product.findUnique({
    where: { id, tenantSlug, deletedAt: { isSet: false } },
  });

  if (!product) throw new ProductNotFoundError();

  if (product.status === "ARCHIVED")
    throw new ProductInvalidStatusTransitionError();

  return await prisma.product.update({
    where: { id },
    data: { status: "ARCHIVED" },
  });
};

export default archiveProduct;
