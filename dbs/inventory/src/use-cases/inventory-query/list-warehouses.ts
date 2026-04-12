import type { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../client.js";
import type { ListWarehousesInput, PaginatedResult } from "./types.js";

export async function listWarehouses(input: ListWarehousesInput) {
  const { tenantId, page = 1, limit = 20, search, isActive } = input;

  const where: Prisma.WarehouseWhereInput = {
    tenantId,
    deletedAt: null,
    ...(isActive !== undefined && { isActive }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { code: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.warehouse.findMany({
      where,
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
        _count: { select: { zones: true, inventoryItems: true } },
      },
      orderBy: { name: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.warehouse.count({ where }),
  ]);

  return { data, page, limit, total } satisfies PaginatedResult<
    (typeof data)[number]
  >;
}
