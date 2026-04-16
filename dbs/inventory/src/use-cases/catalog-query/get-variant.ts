import { prisma } from "../../client.js";
import type { GetByIdInput } from "./types.js";

export async function getVariant(input: GetByIdInput) {
  const { tenantId, id } = input;

  return prisma.productVariant.findFirst({
    where: { id, tenantId, deletedAt: null },
    select: {
      id: true,
      tenantId: true,
      sku: true,
      name: true,
      barcode: true,
      options: true,
      trackingType: true,
      weight: true,
      length: true,
      width: true,
      height: true,
      dimensionUnit: true,
      weightUnit: true,
      imageUrl: true,
      metadata: true,
      isActive: true,
      productId: true,
      baseUomId: true,
      createdAt: true,
      updatedAt: true,
      product: {
        select: {
          id: true,
          sku: true,
          name: true,
          slug: true,
          status: true,
          categoryId: true,
          brandId: true,
          category: { select: { id: true, name: true } },
          brand: { select: { id: true, name: true } },
        },
      },
      baseUom: { select: { id: true, name: true, abbreviation: true } },
    },
  });
}
