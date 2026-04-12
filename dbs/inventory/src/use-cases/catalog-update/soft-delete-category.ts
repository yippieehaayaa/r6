import { prisma } from "../../client.js";
import { writeAuditLog } from "../_shared/audit.js";
import type { Category, SoftDeleteInput } from "./types.js";

const softDeleteCategory = async (
  input: SoftDeleteInput,
): Promise<Category> => {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.category.findFirst({
      where: { id: input.id, tenantId: input.tenantId, deletedAt: null },
    });
    if (!existing) {
      throw new Error("Category not found");
    }

    const childCount = await tx.category.count({
      where: {
        parentId: input.id,
        tenantId: input.tenantId,
        deletedAt: null,
      },
    });
    if (childCount > 0) {
      throw new Error(
        "Cannot delete category with active children. Re-parent or delete children first.",
      );
    }

    const productCount = await tx.product.count({
      where: {
        categoryId: input.id,
        tenantId: input.tenantId,
        deletedAt: null,
      },
    });
    if (productCount > 0) {
      throw new Error(
        "Cannot delete category with assigned products. Re-assign products first.",
      );
    }

    const deleted = await tx.category.update({
      where: { id: input.id },
      data: { deletedAt: new Date(), isActive: false },
    });

    await writeAuditLog(tx, {
      tenantId: input.tenantId,
      entityType: "Category",
      entityId: input.id,
      action: "DELETE",
      changedBy: input.performedBy,
      before: existing,
      after: deleted,
    });

    return deleted;
  });
};

export { softDeleteCategory };
