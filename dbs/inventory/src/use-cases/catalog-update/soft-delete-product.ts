import { prisma } from "../../client.js";
import { writeAuditLog } from "../_shared/audit.js";
import type { Product, SoftDeleteInput } from "./types.js";

const softDeleteProduct = async (input: SoftDeleteInput): Promise<Product> => {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.product.findFirst({
      where: { id: input.id, tenantId: input.tenantId, deletedAt: null },
    });
    if (!existing) {
      throw new Error("Product not found");
    }

    const activeVariants = await tx.productVariant.count({
      where: {
        productId: input.id,
        tenantId: input.tenantId,
        isActive: true,
        deletedAt: null,
      },
    });
    if (activeVariants > 0) {
      throw new Error(
        "Cannot delete product with active variants. Deactivate or delete all variants first.",
      );
    }

    const now = new Date();

    await tx.productVariant.updateMany({
      where: {
        productId: input.id,
        tenantId: input.tenantId,
        deletedAt: null,
      },
      data: { deletedAt: now },
    });

    const deleted = await tx.product.update({
      where: { id: input.id },
      data: { deletedAt: now, status: "ARCHIVED" },
    });

    await writeAuditLog(tx, {
      tenantId: input.tenantId,
      entityType: "Product",
      entityId: input.id,
      action: "DELETE",
      changedBy: input.performedBy,
      before: existing,
      after: deleted,
    });

    return deleted;
  });
};

export { softDeleteProduct };
