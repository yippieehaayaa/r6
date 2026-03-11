import {
  CategorySlugExistsError,
  ParentCategoryNotFoundError,
} from "../../../utils/errors";
import { prisma } from "../../../utils/prisma";

export type CreateCategoryInput = {
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  isActive?: boolean;
  sortOrder?: number;
};

const createCategory = async (input: CreateCategoryInput) => {
  if (input.parentId) {
    const parent = await prisma.category.findUnique({
      where: { id: input.parentId, deletedAt: { isSet: false } },
    });
    if (!parent) throw new ParentCategoryNotFoundError();
  }

  try {
    return await prisma.category.create({
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description,
        parentId: input.parentId,
        isActive: input.isActive,
        sortOrder: input.sortOrder,
      },
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

export default createCategory;
