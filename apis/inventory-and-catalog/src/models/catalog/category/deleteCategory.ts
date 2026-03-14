import {
  CategoryHasChildrenError,
  CategoryHasProductsError,
  CategoryNotFoundError,
} from "../../../utils/errors";
import { prisma } from "../../../utils/prisma";

const deleteCategory = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: { id, deletedAt: { isSet: false } },
  });

  if (!category) throw new CategoryNotFoundError();

  const [productCount, childCount] = await Promise.all([
    prisma.product.count({
      where: { categoryId: id, deletedAt: { isSet: false } },
    }),
    prisma.category.count({
      where: { parentId: id, deletedAt: { isSet: false } },
    }),
  ]);

  if (productCount > 0) throw new CategoryHasProductsError();
  if (childCount > 0) throw new CategoryHasChildrenError();

  return await prisma.category.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};

export default deleteCategory;
