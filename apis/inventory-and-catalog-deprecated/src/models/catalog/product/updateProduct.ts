import {
  BrandNotFoundError,
  CategoryNotFoundError,
  ProductNotFoundError,
  ProductSkuExistsError,
  ProductSlugExistsError,
} from "../../../utils/errors";
import { prisma } from "../../../utils/prisma";

export type UpdateProductInput = {
  sku?: string;
  name?: string;
  slug?: string;
  description?: string;
  tags?: string[];
  metadata?: object;
  categoryId?: string;
  brandId?: string;
};

const updateProduct = async (
  tenantSlug: string,
  id: string,
  input: UpdateProductInput,
) => {
  const product = await prisma.product.findUnique({
    where: { id, tenantSlug, deletedAt: { isSet: false } },
  });

  if (!product) throw new ProductNotFoundError();

  if (input.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: input.categoryId, deletedAt: { isSet: false } },
    });
    if (!category) throw new CategoryNotFoundError();
  }

  if (input.brandId) {
    const brand = await prisma.brand.findUnique({
      where: { id: input.brandId, deletedAt: { isSet: false } },
    });
    if (!brand) throw new BrandNotFoundError();
  }

  try {
    return await prisma.product.update({
      where: { id },
      data: input,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      const target = (error as { meta?: { target?: string[] } }).meta?.target;
      if (target?.includes("sku")) throw new ProductSkuExistsError();
      throw new ProductSlugExistsError();
    }
    throw error;
  }
};

export default updateProduct;
