import { prisma } from "../client.js";
import { writeAuditLog, writeAuditLogs } from "./audit.js";
import type { ProductSetupInput, ProductSetupResult } from "./types.js";

const setupProduct = async (
  input: ProductSetupInput,
): Promise<ProductSetupResult> => {
  return prisma.$transaction(async (tx) => {
    const config = await tx.tenantInventoryConfig.findUnique({
      where: { tenantId: input.tenantId },
    });
    if (!config) {
      throw new Error(`Tenant ${input.tenantId} has not been onboarded`);
    }

    let categoryId: string | undefined;
    if (input.product.categorySlug) {
      const category = await tx.category.findUnique({
        where: {
          tenantId_slug: {
            tenantId: input.tenantId,
            slug: input.product.categorySlug,
          },
        },
      });
      if (!category) {
        throw new Error(`Category "${input.product.categorySlug}" not found`);
      }
      categoryId = category.id;
    }

    let brandId: string | undefined;
    if (input.product.brandSlug) {
      const brand = await tx.brand.findUnique({
        where: {
          tenantId_slug: {
            tenantId: input.tenantId,
            slug: input.product.brandSlug,
          },
        },
      });
      if (!brand) {
        throw new Error(`Brand "${input.product.brandSlug}" not found`);
      }
      brandId = brand.id;
    }

    const product = await tx.product.create({
      data: {
        tenantId: input.tenantId,
        sku: input.product.sku,
        name: input.product.name,
        slug: input.product.slug,
        ...(input.product.description && {
          description: input.product.description,
        }),
        ...(input.product.tags?.length && { tags: input.product.tags }),
        ...(input.product.metadata && {
          metadata: input.product.metadata,
        }),
        ...(categoryId && { categoryId }),
        ...(brandId && { brandId }),
        status: "DRAFT",
      },
    });

    const uomAbbreviations = [
      ...new Set(input.variants.map((v) => v.baseUomAbbreviation)),
    ];
    const uoms = await tx.unitOfMeasure.findMany({
      where: {
        tenantId: input.tenantId,
        abbreviation: { in: uomAbbreviations },
        isActive: true,
        deletedAt: null,
      },
    });
    const uomByAbbreviation = new Map(uoms.map((u) => [u.abbreviation, u]));

    const variants = await Promise.all(
      input.variants.map((v) => {
        const baseUom = uomByAbbreviation.get(v.baseUomAbbreviation);
        if (!baseUom) {
          throw new Error(
            `UOM "${v.baseUomAbbreviation}" not found or inactive`,
          );
        }
        return tx.productVariant.create({
          data: {
            tenantId: input.tenantId,
            productId: product.id,
            sku: v.sku,
            name: v.name,
            options: v.options,
            baseUomId: baseUom.id,
            trackingType: v.trackingType ?? "NONE",
            ...(v.barcode && { barcode: v.barcode }),
            ...(v.weight && { weight: v.weight }),
            ...(v.length && { length: v.length }),
            ...(v.width && { width: v.width }),
            ...(v.height && { height: v.height }),
            ...(v.dimensionUnit && {
              dimensionUnit: v.dimensionUnit,
            }),
            ...(v.weightUnit && { weightUnit: v.weightUnit }),
            ...(v.imageUrl && { imageUrl: v.imageUrl }),
            ...(v.metadata && { metadata: v.metadata }),
          },
        });
      }),
    );

    await writeAuditLog(tx, {
      tenantId: input.tenantId,
      entityType: "Product",
      entityId: product.id,
      action: "CREATE",
      changedBy: input.performedBy,
      after: product,
    });

    await writeAuditLogs(
      tx,
      variants.map((variant) => ({
        tenantId: input.tenantId,
        entityType: "ProductVariant",
        entityId: variant.id,
        action: "CREATE" as const,
        changedBy: input.performedBy,
        after: variant,
      })),
    );

    return { product, variants };
  });
};

export { setupProduct };
