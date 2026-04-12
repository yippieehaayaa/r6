import { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../client.js";
import { writeAuditLog } from "../_shared/audit.js";
import type { Product, UpdateProductInput } from "./types.js";

const VALID_TRANSITIONS: Record<string, string[]> = {
	DRAFT: ["ACTIVE"],
	ACTIVE: ["DISCONTINUED"],
	DISCONTINUED: ["ACTIVE", "ARCHIVED"],
	ARCHIVED: [],
};

const updateProduct = async (input: UpdateProductInput): Promise<Product> => {
	return prisma.$transaction(async (tx) => {
		const existing = await tx.product.findFirst({
			where: { id: input.id, tenantId: input.tenantId, deletedAt: null },
		});
		if (!existing) {
			throw new Error("Product not found");
		}

		if (input.status && input.status !== existing.status) {
			const allowed = VALID_TRANSITIONS[existing.status] ?? [];
			if (!allowed.includes(input.status)) {
				throw new Error(
					`Invalid status transition: ${existing.status} → ${input.status}`,
				);
			}
		}

		if (input.categoryId !== undefined && input.categoryId !== null) {
			const category = await tx.category.findFirst({
				where: {
					id: input.categoryId,
					tenantId: input.tenantId,
					deletedAt: null,
				},
			});
			if (!category) {
				throw new Error("Category not found");
			}
		}

		if (input.brandId !== undefined && input.brandId !== null) {
			const brand = await tx.brand.findFirst({
				where: {
					id: input.brandId,
					tenantId: input.tenantId,
					deletedAt: null,
				},
			});
			if (!brand) {
				throw new Error("Brand not found");
			}
		}

		const data: Prisma.ProductUncheckedUpdateInput = {};
		if (input.name !== undefined) data.name = input.name;
		if (input.description !== undefined) data.description = input.description;
		if (input.tags !== undefined) data.tags = input.tags;
		if (input.metadata !== undefined)
			data.metadata =
				input.metadata === null
					? Prisma.JsonNull
					: (input.metadata as Prisma.InputJsonValue);
		if (input.status !== undefined) data.status = input.status;
		if (input.categoryId !== undefined) data.categoryId = input.categoryId;
		if (input.brandId !== undefined) data.brandId = input.brandId;

		const updated = await tx.product.update({
			where: { id: input.id },
			data,
		});

		await writeAuditLog(tx, {
			tenantId: input.tenantId,
			entityType: "Product",
			entityId: input.id,
			action: "UPDATE",
			changedBy: input.performedBy,
			before: existing,
			after: updated,
		});

		return updated;
	});
};

export { updateProduct };
