import { prisma } from "../../client.js";
import { writeAuditLog } from "../_shared/audit.js";
import type { ProductVariant, SoftDeleteInput } from "./types.js";

const softDeleteVariant = async (
  input: SoftDeleteInput,
): Promise<ProductVariant> => {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.productVariant.findFirst({
      where: { id: input.id, tenantId: input.tenantId, deletedAt: null },
    });
    if (!existing) {
      throw new Error("Variant not found");
    }

    const activeReservations = await tx.stockReservation.count({
      where: {
        variantId: input.id,
        status: "ACTIVE",
      },
    });
    if (activeReservations > 0) {
      throw new Error(
        "Cannot delete variant with active reservations. Release or fulfill reservations first.",
      );
    }

    const deleted = await tx.productVariant.update({
      where: { id: input.id },
      data: { deletedAt: new Date(), isActive: false },
    });

    await writeAuditLog(tx, {
      tenantId: input.tenantId,
      entityType: "ProductVariant",
      entityId: input.id,
      action: "DELETE",
      changedBy: input.performedBy,
      before: existing,
      after: deleted,
    });

    return deleted;
  });
};

export { softDeleteVariant };
