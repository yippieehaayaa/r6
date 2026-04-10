import { CategoryNotFoundError } from "../../../utils/errors";
import { prisma } from "../../../utils/prisma";

const getCategoryById = async (tenantSlug: string, id: string) => {
  const category = await prisma.category.findUnique({
    where: { id, tenantSlug, deletedAt: { isSet: false } },
  });

  if (!category) throw new CategoryNotFoundError();

  return category;
};

export default getCategoryById;
