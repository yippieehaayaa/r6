import { prisma } from "../../client.js";
import type { GetByIdInput } from "../catalog-query/types.js";

export async function getWarehouse(input: GetByIdInput) {
  const { tenantId, id } = input;

  return prisma.warehouse.findFirst({
    where: { id, tenantId, deletedAt: null },
    select: {
      id: true,
      tenantId: true,
      name: true,
      code: true,
      description: true,
      isActive: true,
      addressLine1: true,
      addressLine2: true,
      addressBarangay: true,
      addressCity: true,
      addressProvince: true,
      addressState: true,
      addressCountry: true,
      addressPostal: true,
      landmark: true,
      contactName: true,
      contactPhone: true,
      contactEmail: true,
      createdAt: true,
      updatedAt: true,
      zones: {
        where: { deletedAt: null },
        select: {
          id: true,
          name: true,
          code: true,
          description: true,
          isActive: true,
          binLocations: {
            where: { deletedAt: null },
            select: {
              id: true,
              code: true,
              description: true,
              isActive: true,
            },
            orderBy: { code: "asc" },
          },
        },
        orderBy: { name: "asc" },
      },
    },
  });
}
