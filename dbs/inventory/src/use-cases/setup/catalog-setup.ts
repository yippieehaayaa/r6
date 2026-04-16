import { prisma } from "../../client.js";
import { writeAuditLogs } from "../_shared/audit.js";
import type { CatalogSetupInput, CatalogSetupResult } from "./types.js";

const setupCatalog = async (
  input: CatalogSetupInput,
): Promise<CatalogSetupResult> => {
  return prisma.$transaction(async (tx) => {
    const config = await tx.tenantInventoryConfig.findUnique({
      where: { tenantId: input.tenantId },
    });
    if (!config) {
      throw new Error(`Tenant ${input.tenantId} has not been onboarded`);
    }

    const existingUoms = await tx.unitOfMeasure.findMany({
      where: { tenantId: input.tenantId, deletedAt: null },
      select: { abbreviation: true },
    });
    const existingAbbreviations = new Set(
      existingUoms.map((u) => u.abbreviation),
    );
    for (const uom of input.uoms) {
      if (existingAbbreviations.has(uom.abbreviation)) {
        throw new Error(
          `UOM abbreviation "${uom.abbreviation}" already exists for this tenant`,
        );
      }
    }

    const uoms = await Promise.all(
      input.uoms.map((uom) =>
        tx.unitOfMeasure.create({
          data: {
            tenantId: input.tenantId,
            name: uom.name,
            abbreviation: uom.abbreviation,
            uomType: uom.uomType,
          },
        }),
      ),
    );

    await writeAuditLogs(
      tx,
      uoms.map((uom) => ({
        tenantId: input.tenantId,
        entityType: "UnitOfMeasure",
        entityId: uom.id,
        action: "CREATE" as const,
        changedBy: input.performedBy,
        after: uom,
      })),
    );

    if (!input.conversions?.length) {
      return { uoms, conversions: [] };
    }

    const allUoms = await tx.unitOfMeasure.findMany({
      where: { tenantId: input.tenantId, isActive: true, deletedAt: null },
    });
    const uomByAbbreviation = new Map(allUoms.map((u) => [u.abbreviation, u]));

    const conversions = await Promise.all(
      input.conversions.map((conv) => {
        const fromUom = uomByAbbreviation.get(conv.fromAbbreviation);
        const toUom = uomByAbbreviation.get(conv.toAbbreviation);
        if (!fromUom) {
          throw new Error(`UOM "${conv.fromAbbreviation}" not found`);
        }
        if (!toUom) {
          throw new Error(`UOM "${conv.toAbbreviation}" not found`);
        }
        return tx.uomConversion.create({
          data: {
            tenantId: input.tenantId,
            fromUomId: fromUom.id,
            toUomId: toUom.id,
            conversionFactor: conv.conversionFactor,
          },
        });
      }),
    );

    await writeAuditLogs(
      tx,
      conversions.map((conv) => ({
        tenantId: input.tenantId,
        entityType: "UomConversion",
        entityId: conv.id,
        action: "CREATE" as const,
        changedBy: input.performedBy,
        after: conv,
      })),
    );

    return { uoms, conversions };
  });
};

export { setupCatalog };
