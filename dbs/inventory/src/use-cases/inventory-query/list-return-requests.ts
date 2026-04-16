import type { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../client.js";
import type { ListReturnRequestsInput, PaginatedResult } from "./types.js";

export async function listReturnRequests(input: ListReturnRequestsInput) {
  const { tenantId, page = 1, limit = 20, search, status, referenceId } = input;

  const where: Prisma.ReturnRequestWhereInput = {
    tenantId,
    deletedAt: null,
    ...(status && { status }),
    ...(referenceId && { referenceId }),
    ...(search && {
      OR: [
        { returnReason: { contains: search, mode: "insensitive" as const } },
        { referenceId: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.returnRequest.findMany({
      where,
      select: {
        id: true,
        tenantId: true,
        returnReason: true,
        status: true,
        approvedAt: true,
        receivedAt: true,
        completedAt: true,
        performedBy: true,
        approvedBy: true,
        referenceId: true,
        referenceType: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.returnRequest.count({ where }),
  ]);

  return { data, page, limit, total } satisfies PaginatedResult<
    (typeof data)[number]
  >;
}
