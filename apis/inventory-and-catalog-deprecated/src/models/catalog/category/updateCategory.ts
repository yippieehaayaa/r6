import {
  CategoryNotFoundError,
  CategorySlugExistsError,
  ParentCategoryNotFoundError,
} from "../../../utils/errors";
import { prisma } from "../../../utils/prisma";

export type UpdateCategoryInput = {
  name?: string;
  slug?: string;
  description?: string;
  parentId?: string;
  isActive?: boolean;
  sortOrder?: number;
};

const updateCategory = async (
  tenantSlug: string,
  id: string,
  input: UpdateCategoryInput,
) => {
  const category = await prisma.category.findUnique({
    where: { id, tenantSlug, deletedAt: { isSet: false } },
  });

  if (!category) throw new CategoryNotFoundError();

  if (input.parentId) {
    const parent = await prisma.category.findUnique({
      where: { id: input.parentId, deletedAt: { isSet: false } },
    });
    if (!parent) throw new ParentCategoryNotFoundError();
  }

  try {
    return await prisma.category.update({
      where: { id },
      data: input,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      throw new CategorySlugExistsError();
    }
    throw error;
  }
};

export default updateCategory;
