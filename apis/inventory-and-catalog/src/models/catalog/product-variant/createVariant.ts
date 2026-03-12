import {
  ProductNotFoundError,
  ProductVariantSkuExistsError,
} from "../../../utils/errors";
import {
  type DimensionUnit,
  type ImageEmbed,
  prisma,
  type WeightUnit,
} from "../../../utils/prisma";

export type CreateVariantInput = {
  sku: string;
  name: string;
  options: Record<string, string>;
  price: number;
  costPrice?: number;
  compareAtPrice?: number;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  dimensionUnit?: DimensionUnit;
  weightUnit?: WeightUnit;
  currency?: string;
  images?: ImageEmbed[];
  isActive?: boolean;
  productId: string;
};

const createVariant = async (input: CreateVariantInput) => {
  const product = await prisma.product.findUnique({
    where: { id: input.productId, deletedAt: { isSet: false } },
  });

  if (!product) throw new ProductNotFoundError();

  try {
    return await prisma.productVariant.create({
      data: {
        sku: input.sku,
        name: input.name,
        options: input.options,
        price: input.price,
        costPrice: input.costPrice,
        compareAtPrice: input.compareAtPrice,
        weight: input.weight,
        length: input.length,
        width: input.width,
        height: input.height,
        dimensionUnit: input.dimensionUnit,
        weightUnit: input.weightUnit,
        currency: input.currency,
        images: input.images ?? [],
        isActive: input.isActive,
        productId: input.productId,
      },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      throw new ProductVariantSkuExistsError();
    }
    throw error;
  }
};

export default createVariant;
