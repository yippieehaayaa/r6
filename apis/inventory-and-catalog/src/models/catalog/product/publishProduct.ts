import {
  ProductInvalidStatusTransitionError,
  ProductNotFoundError,
} from "../../../utils/errors";
import { prisma } from "../../../utils/prisma";

const publishProduct = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id, deletedAt: { isSet: false } },
  });

  if (!product) throw new ProductNotFoundError();

  if (product.status !== "DRAFT")
    throw new ProductInvalidStatusTransitionError();

  return await prisma.product.update({
    where: { id },
    data: { status: "ACTIVE" },
  });
};

export default publishProduct;
