import { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../client.js";
import { writeAuditLog } from "../_shared/audit.js";
import type { ProductVariant, UpdateVariantInput } from "./types.js";

const updateVariant = async (
  input: UpdateVariantInput,
): Promise<ProductVariant> => {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.productVariant.findFirst({
      where: { id: input.id, tenantId: input.tenantId, deletedAt: null },
    });
    if (!existing) {
      throw new Error("Variant not found");
    }

    if (input.barcode !== undefined && input.barcode !== null) {
      const duplicate = await tx.productVariant.findFirst({
        where: {
          tenantId: input.tenantId,
          barcode: input.barcode,
          id: { not: input.id },
          deletedAt: null,
        },
      });
      if (duplicate) {
        throw new Error(`Barcode "${input.barcode}" is already in use`);
      }
    }

    const data: Prisma.ProductVariantUncheckedUpdateInput = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.barcode !== undefined) data.barcode = input.barcode;
    if (input.options !== undefined)
      data.options = input.options as Prisma.InputJsonValue;
    if (input.weight !== undefined) data.weight = input.weight;
    if (input.length !== undefined) data.length = input.length;
    if (input.width !== undefined) data.width = input.width;
    if (input.height !== undefined) data.height = input.height;
    if (input.dimensionUnit !== undefined)
      data.dimensionUnit = input.dimensionUnit;
    if (input.weightUnit !== undefined) data.weightUnit = input.weightUnit;
    if (input.imageUrl !== undefined) data.imageUrl = input.imageUrl;
    if (input.metadata !== undefined)
      data.metadata =
        input.metadata === null
          ? Prisma.JsonNull
          : (input.metadata as Prisma.InputJsonValue);
    if (input.isActive !== undefined) data.isActive = input.isActive;

    const updated = await tx.productVariant.update({
      where: { id: input.id },
      data,
    });

    await writeAuditLog(tx, {
      tenantId: input.tenantId,
      entityType: "ProductVariant",
      entityId: input.id,
      action: "UPDATE",
      changedBy: input.performedBy,
      before: existing,
      after: updated,
    });

    return updated;
  });
};

export { updateVariant };
