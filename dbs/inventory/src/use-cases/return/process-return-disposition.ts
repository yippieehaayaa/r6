import type {
  InventoryLot,
  ReturnDisposition,
} from "../../../generated/prisma/client.js";
import { prisma } from "../../client.js";
import type { TransactionClient } from "../_shared/audit.js";
import { writeAuditLog } from "../_shared/audit.js";
import type {
  DispositionLineResult,
  ProcessReturnDispositionInput,
  ProcessReturnDispositionResult,
} from "./types.js";

const processReturnDisposition = async (
  input: ProcessReturnDispositionInput,
): Promise<ProcessReturnDispositionResult> => {
  return prisma.$transaction(async (tx) => {
    const config = await tx.tenantInventoryConfig.findUnique({
      where: { tenantId: input.tenantId },
    });
    if (!config) {
      throw new Error(`Tenant ${input.tenantId} has not been onboarded`);
    }

    const warehouse = await tx.warehouse.findFirst({
      where: {
        id: input.warehouseId,
        tenantId: input.tenantId,
        isActive: true,
        deletedAt: null,
      },
    });
    if (!warehouse) {
      throw new Error(
        `Warehouse ${input.warehouseId} not found, inactive, or deleted`,
      );
    }

    const returnRequest = await tx.returnRequest.findFirst({
      where: {
        id: input.returnRequestId,
        tenantId: input.tenantId,
        deletedAt: null,
      },
      include: { items: true },
    });

    if (!returnRequest) {
      throw new Error(`Return request ${input.returnRequestId} not found`);
    }
    if (returnRequest.status !== "RECEIVED") {
      throw new Error(
        `Return request ${input.returnRequestId} cannot be dispositioned (status: ${returnRequest.status})`,
      );
    }
    if (!returnRequest.items.length) {
      throw new Error(`Return request ${input.returnRequestId} has no items`);
    }

    const results: DispositionLineResult[] = [];

    for (const item of returnRequest.items) {
      switch (item.disposition) {
        case "RESTOCK": {
          const result = await processRestock(
            tx,
            input.tenantId,
            input.warehouseId,
            input.performedBy,
            returnRequest.id,
            item,
            config.defaultCurrency,
          );
          results.push(result);
          break;
        }
        case "DAMAGE": {
          const result = await processDamage(
            tx,
            input.tenantId,
            input.warehouseId,
            input.performedBy,
            returnRequest.id,
            item,
          );
          results.push(result);
          break;
        }
        case "RETURN_TO_SUPPLIER": {
          results.push({ item, alerts: [] });
          break;
        }
        default:
          throw new Error(
            `Unknown disposition "${item.disposition}" on item ${item.id}`,
          );
      }
    }

    const before = { ...returnRequest };
    const updatedRequest = await tx.returnRequest.update({
      where: { id: returnRequest.id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });

    const auditLog = await writeAuditLog(tx, {
      tenantId: input.tenantId,
      entityType: "ReturnRequest",
      entityId: returnRequest.id,
      action: "UPDATE",
      changedBy: input.performedBy,
      before,
      after: updatedRequest,
    });

    return { returnRequest: updatedRequest, lines: results, auditLog };
  });
};

type ReturnRequestItemRow = {
  id: string;
  tenantId: string | null;
  variantId: string;
  lotId: string | null;
  quantityReturned: number;
  serialNumber: string | null;
  disposition: ReturnDisposition;
  dispositionNotes: string | null;
  returnRequestId: string;
  createdAt: Date;
  updatedAt: Date;
};

const processRestock = async (
  tx: TransactionClient,
  tenantId: string,
  warehouseId: string,
  performedBy: string,
  returnRequestId: string,
  item: ReturnRequestItemRow,
  defaultCurrency: string,
): Promise<DispositionLineResult> => {
  let originalLot: InventoryLot | null = null;

  if (item.lotId) {
    originalLot = await tx.inventoryLot.findUnique({
      where: { id: item.lotId },
    });
  }

  let lot: InventoryLot;

  if (originalLot && !originalLot.deletedAt) {
    lot = await tx.inventoryLot.update({
      where: { id: originalLot.id },
      data: { quantityRemaining: { increment: item.quantityReturned } },
    });
  } else {
    lot = await tx.inventoryLot.create({
      data: {
        tenantId,
        variantId: item.variantId,
        warehouseId,
        quantityReceived: item.quantityReturned,
        quantityRemaining: item.quantityReturned,
        unitCost: originalLot?.unitCost ?? 0,
        unitCostCurrency: originalLot?.unitCostCurrency ?? defaultCurrency,
        receivedAt: new Date(),
        referenceId: returnRequestId,
        referenceType: "RETURN_REQUEST",
        ...(originalLot?.lotNumber && { lotNumber: originalLot.lotNumber }),
        ...(originalLot?.expiresAt && { expiresAt: originalLot.expiresAt }),
      },
    });
  }

  const movement = await tx.stockMovement.create({
    data: {
      tenantId,
      type: "RETURN",
      quantity: item.quantityReturned,
      unitCostSnapshot: originalLot?.unitCost ?? null,
      costCurrency: originalLot?.unitCostCurrency ?? defaultCurrency,
      referenceId: returnRequestId,
      referenceType: "RETURN_REQUEST",
      performedBy,
      variantId: item.variantId,
      warehouseId,
      lotId: lot.id,
    },
  });

  const inventoryItem = await upsertInventoryItem(
    tx,
    tenantId,
    item.variantId,
    warehouseId,
    item.quantityReturned,
  );

  if (item.serialNumber) {
    await tx.serializedUnit.updateMany({
      where: {
        tenantId,
        serialNumber: item.serialNumber,
        variantId: item.variantId,
      },
      data: { status: "AVAILABLE" },
    });
  }

  const alerts = await checkOverstockAlert(
    tx,
    tenantId,
    item.variantId,
    warehouseId,
    inventoryItem.quantityOnHand,
    inventoryItem.overstockThreshold,
  );

  return { item, lot, movement, inventoryItem, alerts };
};

const processDamage = async (
  tx: TransactionClient,
  tenantId: string,
  warehouseId: string,
  performedBy: string,
  returnRequestId: string,
  item: ReturnRequestItemRow,
): Promise<DispositionLineResult> => {
  let unitCostSnapshot = null;
  let costCurrency = "PHP";

  if (item.lotId) {
    const originalLot = await tx.inventoryLot.findUnique({
      where: { id: item.lotId },
    });
    if (originalLot) {
      unitCostSnapshot = originalLot.unitCost;
      costCurrency = originalLot.unitCostCurrency;
    }
  }

  const movement = await tx.stockMovement.create({
    data: {
      tenantId,
      type: "DAMAGE",
      quantity: -item.quantityReturned,
      unitCostSnapshot,
      costCurrency,
      referenceId: returnRequestId,
      referenceType: "RETURN_REQUEST",
      performedBy,
      variantId: item.variantId,
      warehouseId,
      ...(item.lotId && { lotId: item.lotId }),
    },
  });

  if (item.serialNumber) {
    await tx.serializedUnit.updateMany({
      where: {
        tenantId,
        serialNumber: item.serialNumber,
        variantId: item.variantId,
      },
      data: { status: "DAMAGED" },
    });
  }

  return { item, movement, alerts: [] };
};

const upsertInventoryItem = async (
  tx: TransactionClient,
  tenantId: string,
  variantId: string,
  warehouseId: string,
  quantityDelta: number,
) => {
  const existing = await tx.inventoryItem.findUnique({
    where: {
      tenantId_variantId_warehouseId: { tenantId, variantId, warehouseId },
    },
  });

  if (existing) {
    return tx.inventoryItem.update({
      where: { id: existing.id },
      data: { quantityOnHand: { increment: quantityDelta } },
    });
  }

  return tx.inventoryItem.create({
    data: {
      tenantId,
      variantId,
      warehouseId,
      quantityOnHand: quantityDelta,
    },
  });
};

const checkOverstockAlert = async (
  tx: TransactionClient,
  tenantId: string,
  variantId: string,
  warehouseId: string,
  currentQty: number,
  overstockThreshold: number,
) => {
  if (overstockThreshold <= 0 || currentQty < overstockThreshold) {
    return [];
  }

  const existingAlert = await tx.stockAlert.findFirst({
    where: {
      tenantId,
      variantId,
      warehouseId,
      alertType: "OVERSTOCK",
      status: "OPEN",
    },
  });

  if (existingAlert) return [];

  const alert = await tx.stockAlert.create({
    data: {
      tenantId,
      variantId,
      warehouseId,
      alertType: "OVERSTOCK",
      status: "OPEN",
      threshold: overstockThreshold,
      currentQty,
    },
  });

  return [alert];
};

export { processReturnDisposition };
