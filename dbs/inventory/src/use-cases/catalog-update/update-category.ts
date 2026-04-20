import type { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../client.js";
import type { TransactionClient } from "../_shared/audit.js";
import { writeAuditLog } from "../_shared/audit.js";
import type { Category, UpdateCategoryInput } from "./types.js";

const updateCategory = async (
  input: UpdateCategoryInput,
): Promise<Category> => {
  return prisma.$transaction(async (tx: TransactionClient) => {
    const existing = await tx.category.findFirst({
      where: { id: input.id, tenantId: input.tenantId, deletedAt: null },
    });
    if (!existing) {
      throw new Error("Category not found");
    }

    let newParentPath = "";

    if (input.parentId !== undefined) {
      if (input.parentId === input.id) {
        throw new Error("A category cannot be its own parent");
      }

      if (input.parentId !== null) {
        const parent = await tx.category.findFirst({
          where: {
            id: input.parentId,
            tenantId: input.tenantId,
            deletedAt: null,
          },
        });
        if (!parent) {
          throw new Error("Parent category not found");
        }
        if (parent.path.startsWith(`${existing.path}/`)) {
          throw new Error(
            "Cannot re-parent to a descendant (would create a cycle)",
          );
        }
        newParentPath = parent.path;
      }
    }

    const data: Prisma.CategoryUncheckedUpdateInput = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.description !== undefined) data.description = input.description;
    if (input.sortOrder !== undefined) data.sortOrder = input.sortOrder;
    if (input.isActive !== undefined) data.isActive = input.isActive;

    if (input.parentId !== undefined) {
      data.parentId = input.parentId;
      const newPath = `${newParentPath}/${existing.slug}`;
      data.path = newPath;

      const descendants = await tx.category.findMany({
        where: {
          tenantId: input.tenantId,
          path: { startsWith: `${existing.path}/` },
          deletedAt: null,
        },
      });

      for (const desc of descendants) {
        const updatedPath = desc.path.replace(existing.path, newPath);
        await tx.category.update({
          where: { id: desc.id },
          data: { path: updatedPath },
        });
      }
    }

    const updated = await tx.category.update({
      where: { id: input.id },
      data,
    });

    await writeAuditLog(tx, {
      tenantId: input.tenantId,
      entityType: "Category",
      entityId: input.id,
      action: "UPDATE",
      changedBy: input.performedBy,
      before: existing,
      after: updated,
    });

    return updated;
  });
};

export { updateCategory };
