import { prisma } from "../../client.js";
import type { GetByIdInput } from "./types.js";

export async function getCategory(input: GetByIdInput) {
  const { tenantId, id } = input;

  return prisma.category.findFirst({
    where: { id, tenantId, deletedAt: null },
    select: {
      id: true,
      tenantId: true,
      name: true,
      slug: true,
      description: true,
      parentId: true,
      path: true,
      sortOrder: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      parent: { select: { id: true, name: true, slug: true } },
      children: {
        where: { deletedAt: null },
        select: {
          id: true,
          name: true,
          slug: true,
          sortOrder: true,
          isActive: true,
        },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      },
      _count: { select: { products: true } },
    },
  });
}
