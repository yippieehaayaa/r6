import { prisma } from "../../client.js";
import type { GetByIdInput } from "./types.js";

export async function getProduct(input: GetByIdInput) {
  const { tenantId, id } = input;

  return prisma.product.findFirst({
    where: { id, tenantId, deletedAt: null },
    select: {
      id: true,
      tenantId: true,
      sku: true,
      name: true,
      slug: true,
      description: true,
      tags: true,
      metadata: true,
      status: true,
      categoryId: true,
      brandId: true,
      createdAt: true,
      updatedAt: true,
      category: { select: { id: true, name: true, slug: true } },
      brand: { select: { id: true, name: true, slug: true } },
      variants: {
        where: { deletedAt: null },
        select: {
          id: true,
          sku: true,
          name: true,
          barcode: true,
          options: true,
          trackingType: true,
          isActive: true,
          imageUrl: true,
          baseUom: { select: { id: true, name: true, abbreviation: true } },
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}
