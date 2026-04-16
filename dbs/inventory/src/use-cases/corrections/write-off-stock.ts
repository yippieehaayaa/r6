import { prisma } from "../../client.js";
import type { TransactionClient } from "../_shared/audit.js";
import { writeAuditLog } from "../_shared/audit.js";
import type { WriteOffStockInput, WriteOffStockResult } from "./types.js";

const writeOffStock = async (
  input: WriteOffStockInput,
): Promise<WriteOffStockResult> => {
  if (!input.reason.trim()) {
    throw new Error("reason is required for write-offs");
  }

  return prisma.$transaction(async (tx) => {
    const config = await tx.tenantInventoryConfig.findUnique({
      where: { tenantId: input.tenantId },
    });
    if (!config) {
      throw new Error(`Tenant ${input.tenantId} has not been onboarded`);
    }

    const lot = await tx.inventoryLot.findFirst({
      where: {
        id: input.lotId,
        tenantId: input.tenantId,
        deletedAt: null,
      },
    });
    if (!lot) {
      throw new Error(`Lot ${input.lotId} not found or deleted`);
    }
    if (lot.quantityRemaining <= 0) {
      throw new Error(`Lot ${input.lotId} has no remaining stock to write off`);
    }

    const quantityWrittenOff = lot.quantityRemaining;

    const lotBefore = { ...lot };
    const updatedLot = await tx.inventoryLot.update({
      where: { id: lot.id },
      data: { quantityRemaining: 0 },
    });

    const movement = await tx.stockMovement.create({
      data: {
        tenantId: input.tenantId,
        type: "DAMAGE",
        quantity: -quantityWrittenOff,
        unitCostSnapshot: lot.unitCost,
        costCurrency: lot.unitCostCurrency,
        referenceType: "WRITE_OFF",
        notes: input.reason,
        performedBy: input.performedBy,
        variantId: lot.variantId,
        warehouseId: lot.warehouseId,
        lotId: lot.id,
      },
    });

    const inventoryItem = await tx.inventoryItem.update({
      where: {
        tenantId_variantId_warehouseId: {
          tenantId: input.tenantId,
          variantId: lot.variantId,
          warehouseId: lot.warehouseId,
        },
      },
      data: { quantityOnHand: { decrement: quantityWrittenOff } },
    });

    const serializedUnits = await markSerializedUnitsDamaged(
      tx,
      input.tenantId,
      lot.id,
    );

    const auditLog = await writeAuditLog(tx, {
      tenantId: input.tenantId,
      entityType: "InventoryLot",
      entityId: lot.id,
      action: "UPDATE",
      changedBy: input.performedBy,
      before: lotBefore,
      after: updatedLot,
    });

    const quantityAvailable =
      inventoryItem.quantityOnHand - inventoryItem.quantityReserved;
    const alerts = await checkLowStockAlert(
      tx,
      input.tenantId,
      lot.variantId,
      lot.warehouseId,
      quantityAvailable,
      inventoryItem.reorderPoint,
    );

    return {
      lot: updatedLot,
      movement,
      inventoryItem,
      serializedUnits,
      auditLog,
      alerts,
    };
  });
};

const markSerializedUnitsDamaged = async (
  tx: TransactionClient,
  tenantId: string,
  lotId: string,
) => {
  const availableUnits = await tx.serializedUnit.findMany({
    where: {
      tenantId,
      lotId,
      status: "AVAILABLE",
      deletedAt: null,
    },
  });

  if (!availableUnits.length) return [];

  return Promise.all(
    availableUnits.map((unit) =>
      tx.serializedUnit.update({
        where: { id: unit.id },
        data: { status: "DAMAGED" },
      }),
    ),
  );
};

const checkLowStockAlert = async (
  tx: TransactionClient,
  tenantId: string,
  variantId: string,
  warehouseId: string,
  quantityAvailable: number,
  reorderPoint: number,
) => {
  if (reorderPoint <= 0 || quantityAvailable > reorderPoint) {
    return [];
  }

  const alertType =
    quantityAvailable <= 0 ? ("OUT_OF_STOCK" as const) : ("LOW_STOCK" as const);

  const existingAlert = await tx.stockAlert.findFirst({
    where: {
      tenantId,
      variantId,
      warehouseId,
      alertType,
      status: "OPEN",
    },
  });

  if (existingAlert) return [];

  const alert = await tx.stockAlert.create({
    data: {
      tenantId,
      variantId,
      warehouseId,
      alertType,
      status: "OPEN",
      threshold: reorderPoint,
      currentQty: quantityAvailable,
    },
  });

  return [alert];
};

export { writeOffStock };
