import type { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../client.js";
import type { ListVariantsInput, PaginatedResult } from "./types.js";

export async function listVariants(input: ListVariantsInput) {
  const { tenantId, page = 1, limit = 20, search, productId, isActive } = input;

  const where: Prisma.ProductVariantWhereInput = {
    tenantId,
    deletedAt: null,
    ...(productId && { productId }),
    ...(isActive !== undefined && { isActive }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { sku: { contains: search, mode: "insensitive" as const } },
        { barcode: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.productVariant.findMany({
      where,
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
          select: { id: true, sku: true, name: true, slug: true, status: true },
        },
        baseUom: { select: { id: true, name: true, abbreviation: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.productVariant.count({ where }),
  ]);

  return { data, page, limit, total } satisfies PaginatedResult<
    (typeof data)[number]
  >;
}
