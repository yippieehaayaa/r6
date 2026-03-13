import { toMinorUnits } from "../../../utils/currency";
import {
  ProductVariantNotFoundError,
  ProductVariantSkuExistsError,
} from "../../../utils/errors";
import {
  type DimensionUnit,
  type ImageEmbed,
  prisma,
  type WeightUnit,
} from "../../../utils/prisma";

export type UpdateVariantInput = {
  sku?: string;
  name?: string;
  options?: Record<string, string>;
  price?: number;
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
};

const updateVariant = async (id: string, input: UpdateVariantInput) => {
  const variant = await prisma.productVariant.findUnique({
    where: { id, deletedAt: { isSet: false } },
  });

  if (!variant) throw new ProductVariantNotFoundError();

  const { images, price, costPrice, compareAtPrice, ...rest } = input;

  try {
    return await prisma.productVariant.update({
      where: { id },
      data: {
        ...rest,
        ...(price !== undefined && { price: toMinorUnits(price) }),
        ...(costPrice !== undefined && {
          costPrice: toMinorUnits(costPrice),
        }),
        ...(compareAtPrice !== undefined && {
          compareAtPrice: toMinorUnits(compareAtPrice),
        }),
        ...(images !== undefined && { images: { set: images } }),
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

export default updateVariant;
