import { BrandNotFoundError } from "../../../utils/errors";
import { prisma } from "../../../utils/prisma";

const getBrandById = async (id: string) => {
  const brand = await prisma.brand.findUnique({
    where: { id, deletedAt: { isSet: false } },
  });

  if (!brand) throw new BrandNotFoundError();

  return brand;
};

export default getBrandById;
