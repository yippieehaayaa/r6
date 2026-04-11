import { prisma } from "../client.js";
import type { WriteAuditLogParams } from "./audit.js";
import { writeAuditLogs } from "./audit.js";
import type { WarehouseSetupInput, WarehouseSetupResult } from "./types.js";

const setupWarehouse = async (
  input: WarehouseSetupInput,
): Promise<WarehouseSetupResult> => {
  return prisma.$transaction(async (tx) => {
    const config = await tx.tenantInventoryConfig.findUnique({
      where: { tenantId: input.tenantId },
    });
    if (!config) {
      throw new Error(`Tenant ${input.tenantId} has not been onboarded`);
    }

    const existingWarehouse = await tx.warehouse.findUnique({
      where: {
        tenantId_code: {
          tenantId: input.tenantId,
          code: input.warehouse.code,
        },
      },
    });
    if (existingWarehouse) {
      throw new Error(
        `Warehouse code "${input.warehouse.code}" already exists for this tenant`,
      );
    }

    const warehouse = await tx.warehouse.create({
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
    });

    const auditEntries: WriteAuditLogParams[] = [
      {
        tenantId: input.tenantId,
        entityType: "Warehouse",
        entityId: warehouse.id,
        action: "CREATE",
        changedBy: input.performedBy,
        after: warehouse,
      },
    ];

    const zonesWithBins: WarehouseSetupResult["zones"] = [];

    if (input.zones?.length) {
      for (const zoneInput of input.zones) {
        const zone = await tx.warehouseZone.create({
          data: {
            tenantId: input.tenantId,
            warehouseId: warehouse.id,
            name: zoneInput.name,
            code: zoneInput.code,
            ...(zoneInput.description && {
              description: zoneInput.description,
            }),
          },
        });

        auditEntries.push({
          tenantId: input.tenantId,
          entityType: "WarehouseZone",
          entityId: zone.id,
          action: "CREATE",
          changedBy: input.performedBy,
          after: zone,
        });

        const bins = zoneInput.bins?.length
          ? await Promise.all(
              zoneInput.bins.map((binInput) =>
                tx.binLocation.create({
                  data: {
                    tenantId: input.tenantId,
                    zoneId: zone.id,
                    code: binInput.code,
                    ...(binInput.description && {
                      description: binInput.description,
                    }),
                  },
                }),
              ),
            )
          : [];

        for (const bin of bins) {
          auditEntries.push({
            tenantId: input.tenantId,
            entityType: "BinLocation",
            entityId: bin.id,
            action: "CREATE",
            changedBy: input.performedBy,
            after: bin,
          });
        }

        zonesWithBins.push({ ...zone, bins });
      }
    }

    await writeAuditLogs(tx, auditEntries);

    return { warehouse, zones: zonesWithBins };
  });
};

export { setupWarehouse };
