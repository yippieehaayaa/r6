import {
  ProductInvalidStatusTransitionError,
  ProductNotFoundError,
} from "../../../utils/errors";
import { prisma } from "../../../utils/prisma";

const discontinueProduct = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id, deletedAt: { isSet: false } },
  });

  if (!product) throw new ProductNotFoundError();

  if (product.status !== "ACTIVE")
    throw new ProductInvalidStatusTransitionError();

  return await prisma.product.update({
    where: { id },
    data: { status: "DISCONTINUED" },
  });
};

export default discontinueProduct;
