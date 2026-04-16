import type { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../client.js";
import { writeAuditLog } from "../_shared/audit.js";
import type { Brand, UpdateBrandInput } from "./types.js";

const updateBrand = async (input: UpdateBrandInput): Promise<Brand> => {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.brand.findFirst({
      where: { id: input.id, tenantId: input.tenantId, deletedAt: null },
    });
    if (!existing) {
      throw new Error("Brand not found");
    }

    if (input.name !== undefined && input.name !== existing.name) {
      const duplicate = await tx.brand.findFirst({
        where: {
          tenantId: input.tenantId,
          name: input.name,
          id: { not: input.id },
          deletedAt: null,
        },
      });
      if (duplicate) {
        throw new Error(`Brand name "${input.name}" is already in use`);
      }
    }

    const data: Prisma.BrandUncheckedUpdateInput = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.description !== undefined) data.description = input.description;
    if (input.logoUrl !== undefined) data.logoUrl = input.logoUrl;
    if (input.isActive !== undefined) data.isActive = input.isActive;

    const updated = await tx.brand.update({
      where: { id: input.id },
      data,
    });

    await writeAuditLog(tx, {
      tenantId: input.tenantId,
      entityType: "Brand",
      entityId: input.id,
      action: "UPDATE",
      changedBy: input.performedBy,
      before: existing,
      after: updated,
    });

    return updated;
  });
};

export { updateBrand };
