import { prisma } from "../../client.js";
import { writeAuditLog } from "../_shared/audit.js";
import type { Brand, SoftDeleteInput } from "./types.js";

const softDeleteBrand = async (input: SoftDeleteInput): Promise<Brand> => {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.brand.findFirst({
      where: { id: input.id, tenantId: input.tenantId, deletedAt: null },
    });
    if (!existing) {
      throw new Error("Brand not found");
    }

    const productCount = await tx.product.count({
      where: {
        brandId: input.id,
        tenantId: input.tenantId,
        deletedAt: null,
      },
    });
    if (productCount > 0) {
      throw new Error(
        "Cannot delete brand with assigned products. Re-assign products first.",
      );
    }

    const deleted = await tx.brand.update({
      where: { id: input.id },
      data: { deletedAt: new Date(), isActive: false },
    });

    await writeAuditLog(tx, {
      tenantId: input.tenantId,
      entityType: "Brand",
      entityId: input.id,
      action: "DELETE",
      changedBy: input.performedBy,
      before: existing,
      after: deleted,
    });

    return deleted;
  });
};

export { softDeleteBrand };
