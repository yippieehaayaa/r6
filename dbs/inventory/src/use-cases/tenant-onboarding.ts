import { prisma } from "../client.js";
import { writeAuditLogs } from "./audit.js";
import type { TenantOnboardingInput, TenantOnboardingResult } from "./types.js";

const onboardTenant = async (
  input: TenantOnboardingInput,
): Promise<TenantOnboardingResult> => {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.tenantInventoryConfig.findUnique({
      where: { tenantId: input.tenantId },
    });
    if (existing) {
      throw new Error(`Tenant ${input.tenantId} is already onboarded`);
    }

    const [config, baseUom, warehouse] = await Promise.all([
      tx.tenantInventoryConfig.create({
        data: {
          tenantId: input.tenantId,
          ...(input.config?.costingMethod && {
            costingMethod: input.config.costingMethod,
          }),
          ...(input.config?.defaultCurrency && {
            defaultCurrency: input.config.defaultCurrency,
          }),
          ...(input.config?.lotExpiryAlertDays && {
            lotExpiryAlertDays: input.config.lotExpiryAlertDays,
          }),
          ...(input.config?.cartReservationTtlMinutes && {
            cartReservationTtlMinutes: input.config.cartReservationTtlMinutes,
          }),
          ...(input.config?.countVarianceThresholdPct && {
            countVarianceThresholdPct: input.config.countVarianceThresholdPct,
          }),
        },
      }),
      tx.unitOfMeasure.create({
        data: {
          tenantId: input.tenantId,
          name: input.baseUom?.name ?? "Piece",
          abbreviation: input.baseUom?.abbreviation ?? "pcs",
          uomType: "BASE",
        },
      }),
      tx.warehouse.create({
        data: {
          tenantId: input.tenantId,
          name: input.warehouse.name,
          code: input.warehouse.code,
          ...(input.warehouse.description && {
            description: input.warehouse.description,
          }),
          addressLine1: input.warehouse.addressLine1,
          ...(input.warehouse.addressLine2 && {
            addressLine2: input.warehouse.addressLine2,
          }),
          ...(input.warehouse.addressBarangay && {
            addressBarangay: input.warehouse.addressBarangay,
          }),
          addressCity: input.warehouse.addressCity,
          ...(input.warehouse.addressProvince && {
            addressProvince: input.warehouse.addressProvince,
          }),
          addressState: input.warehouse.addressState,
          addressCountry: input.warehouse.addressCountry ?? "PH",
          addressPostal: input.warehouse.addressPostal,
          ...(input.warehouse.landmark && {
            landmark: input.warehouse.landmark,
          }),
          ...(input.warehouse.contactName && {
            contactName: input.warehouse.contactName,
          }),
          ...(input.warehouse.contactPhone && {
            contactPhone: input.warehouse.contactPhone,
          }),
          ...(input.warehouse.contactEmail && {
            contactEmail: input.warehouse.contactEmail,
          }),
        },
      }),
    ]);

    await writeAuditLogs(tx, [
      {
        tenantId: input.tenantId,
        entityType: "TenantInventoryConfig",
        entityId: config.id,
        action: "CREATE",
        changedBy: input.performedBy,
        after: config,
      },
      {
        tenantId: input.tenantId,
        entityType: "UnitOfMeasure",
        entityId: baseUom.id,
        action: "CREATE",
        changedBy: input.performedBy,
        after: baseUom,
      },
      {
        tenantId: input.tenantId,
        entityType: "Warehouse",
        entityId: warehouse.id,
        action: "CREATE",
        changedBy: input.performedBy,
        after: warehouse,
      },
    ]);

    return { config, baseUom, warehouse };
  });
};

export { onboardTenant };
