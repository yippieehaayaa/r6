import { prisma } from "../../client.js";
import type { GetByIdInput } from "./types.js";

export async function getBrand(input: GetByIdInput) {
  const { tenantId, id } = input;

  return prisma.brand.findFirst({
    where: { id, tenantId, deletedAt: null },
    select: {
      id: true,
      tenantId: true,
      name: true,
      slug: true,
      description: true,
      logoUrl: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { products: true } },
    },
  });
}
