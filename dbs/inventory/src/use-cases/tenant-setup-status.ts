import { prisma } from "../client.js";
import type { TenantSetupStatus } from "./types.js";

const getTenantSetupStatus = async (
  tenantId: string,
): Promise<TenantSetupStatus> => {
  const [config, baseUom, warehouse, additionalUom, category, brand] =
    await Promise.all([
      prisma.tenantInventoryConfig.findUnique({
        where: { tenantId },
        select: { id: true },
      }),
      prisma.unitOfMeasure.findFirst({
        where: { tenantId, uomType: "BASE", deletedAt: null },
        select: { id: true },
      }),
      prisma.warehouse.findFirst({
        where: { tenantId, deletedAt: null },
        select: { id: true },
      }),
      prisma.unitOfMeasure.findFirst({
        where: {
          tenantId,
          uomType: { in: ["PURCHASE", "SALE"] },
          deletedAt: null,
        },
        select: { id: true },
      }),
      prisma.category.findFirst({
        where: { tenantId, deletedAt: null },
        select: { id: true },
      }),
      prisma.brand.findFirst({
        where: { tenantId, deletedAt: null },
        select: { id: true },
      }),
    ]);

  return {
    isOnboarded: config !== null,
    hasBaseUom: baseUom !== null,
    hasWarehouse: warehouse !== null,
    hasAdditionalUoms: additionalUom !== null,
    hasCategories: category !== null,
    hasBrands: brand !== null,
  };
};

export { getTenantSetupStatus };
