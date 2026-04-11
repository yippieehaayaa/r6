import { prisma } from "../client.js";
import { writeAuditLog, writeAuditLogs } from "./audit.js";
import type {
  Category,
  CategoryBrandSetupInput,
  CategoryBrandSetupResult,
} from "./types.js";

const setupCategoryAndBrand = async (
  input: CategoryBrandSetupInput,
): Promise<CategoryBrandSetupResult> => {
  return prisma.$transaction(async (tx) => {
    const config = await tx.tenantInventoryConfig.findUnique({
      where: { tenantId: input.tenantId },
    });
    if (!config) {
      throw new Error(`Tenant ${input.tenantId} has not been onboarded`);
    }

    const categories: Category[] = [];

    if (input.categories?.length) {
      const existingCategories = await tx.category.findMany({
        where: { tenantId: input.tenantId, deletedAt: null },
      });
      const categoryBySlug = new Map(
        existingCategories.map((c) => [c.slug, c]),
      );

      for (const cat of input.categories) {
        if (categoryBySlug.has(cat.slug)) {
          throw new Error(
            `Category slug "${cat.slug}" already exists for this tenant`,
          );
        }

        let parentId: string | null = null;
        let parentPath = "";

        if (cat.parentSlug) {
          const parent = categoryBySlug.get(cat.parentSlug);
          if (!parent) {
            throw new Error(`Parent category "${cat.parentSlug}" not found`);
          }
          parentId = parent.id;
          parentPath = parent.path;
        }

        const path = `${parentPath}/${cat.slug}`;

        const created = await tx.category.create({
          data: {
            tenantId: input.tenantId,
            name: cat.name,
            slug: cat.slug,
            path,
            ...(cat.description && { description: cat.description }),
            ...(parentId && { parentId }),
            ...(cat.sortOrder != null && { sortOrder: cat.sortOrder }),
          },
        });

        await writeAuditLog(tx, {
          tenantId: input.tenantId,
          entityType: "Category",
          entityId: created.id,
          action: "CREATE",
          changedBy: input.performedBy,
          after: created,
        });

        categoryBySlug.set(created.slug, created);
        categories.push(created);
      }
    }

    if (input.brands?.length) {
      const existingBrands = await tx.brand.findMany({
        where: { tenantId: input.tenantId, deletedAt: null },
        select: { slug: true, name: true },
      });
      const existingSlugs = new Set(existingBrands.map((b) => b.slug));
      const existingNames = new Set(existingBrands.map((b) => b.name));

      for (const brand of input.brands) {
        if (existingSlugs.has(brand.slug)) {
          throw new Error(
            `Brand slug "${brand.slug}" already exists for this tenant`,
          );
        }
        if (existingNames.has(brand.name)) {
          throw new Error(
            `Brand name "${brand.name}" already exists for this tenant`,
          );
        }
      }
    }

    const brands = await Promise.all(
      (input.brands ?? []).map((brand) =>
        tx.brand.create({
          data: {
            tenantId: input.tenantId,
            name: brand.name,
            slug: brand.slug,
            ...(brand.description && { description: brand.description }),
            ...(brand.logoUrl && { logoUrl: brand.logoUrl }),
          },
        }),
      ),
    );

    if (brands.length) {
      await writeAuditLogs(
        tx,
        brands.map((brand) => ({
          tenantId: input.tenantId,
          entityType: "Brand",
          entityId: brand.id,
          action: "CREATE" as const,
          changedBy: input.performedBy,
          after: brand,
        })),
      );
    }

    return { categories, brands };
  });
};

export { setupCategoryAndBrand };
