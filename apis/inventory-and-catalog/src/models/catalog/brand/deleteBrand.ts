import { BrandHasProductsError, BrandNotFoundError } from "../../../errors";
import { prisma } from "../../../utils/prisma";

const deleteBrand = async (id: string) => {
  const brand = await prisma.brand.findUnique({
    where: { id, deletedAt: { isSet: false } },
  });

  if (!brand) throw new BrandNotFoundError();

  const productCount = await prisma.product.count({
    where: { brandId: id, deletedAt: { isSet: false } },
  });

  if (productCount > 0) throw new BrandHasProductsError();

  return await prisma.brand.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};

export default deleteBrand;
