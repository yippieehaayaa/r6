import {
  BrandNotFoundError,
  CategoryNotFoundError,
  ProductSkuExistsError,
  ProductSlugExistsError,
} from "../../../utils/errors";
import { type ProductStatus, prisma } from "../../../utils/prisma";

export type CreateProductInput = {
  sku: string;
  name: string;
  slug: string;
  description?: string;
  tags?: string[];
  status?: ProductStatus;
  metadata?: object;
  categoryId: string;
  brandId?: string;
};

const createProduct = async (input: CreateProductInput) => {
  const category = await prisma.category.findUnique({
    where: { id: input.categoryId, deletedAt: { isSet: false } },
  });

  if (!category) throw new CategoryNotFoundError();

  if (input.brandId) {
    const brand = await prisma.brand.findUnique({
      where: { id: input.brandId, deletedAt: { isSet: false } },
    });
    if (!brand) throw new BrandNotFoundError();
  }

  try {
    return await prisma.product.create({
      data: {
        sku: input.sku,
        name: input.name,
        slug: input.slug,
        description: input.description,
        tags: input.tags ?? [],
        status: input.status,
        metadata: input.metadata,
        categoryId: input.categoryId,
        brandId: input.brandId,
      },
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

export default createProduct;
