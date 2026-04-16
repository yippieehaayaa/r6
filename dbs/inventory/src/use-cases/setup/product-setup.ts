import type { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../client.js";
import { writeAuditLog, writeAuditLogs } from "../_shared/audit.js";
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

    const productData: Prisma.ProductUncheckedCreateInput = {
      tenantId: input.tenantId,
      sku: input.product.sku,
      name: input.product.name,
      slug: input.product.slug,
      status: "DRAFT",
    };
    if (input.product.description)
      productData.description = input.product.description;
    if (input.product.tags?.length) productData.tags = input.product.tags;
    if (input.product.metadata)
      productData.metadata = input.product.metadata as Prisma.InputJsonValue;
    if (categoryId) productData.categoryId = categoryId;
    if (brandId) productData.brandId = brandId;

    const product = await tx.product.create({ data: productData });

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
        const variantData: Prisma.ProductVariantUncheckedCreateInput = {
          tenantId: input.tenantId,
          productId: product.id,
          sku: v.sku,
          name: v.name,
          options: v.options as Prisma.InputJsonValue,
          baseUomId: baseUom.id,
          trackingType: v.trackingType ?? "NONE",
        };
        if (v.barcode) variantData.barcode = v.barcode;
        if (v.weight) variantData.weight = v.weight;
        if (v.length) variantData.length = v.length;
        if (v.width) variantData.width = v.width;
        if (v.height) variantData.height = v.height;
        if (v.dimensionUnit) variantData.dimensionUnit = v.dimensionUnit;
        if (v.weightUnit) variantData.weightUnit = v.weightUnit;
        if (v.imageUrl) variantData.imageUrl = v.imageUrl;
        if (v.metadata)
          variantData.metadata = v.metadata as Prisma.InputJsonValue;
        return tx.productVariant.create({ data: variantData });
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
