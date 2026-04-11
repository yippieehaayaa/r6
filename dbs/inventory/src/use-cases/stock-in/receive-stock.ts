import { prisma } from "../../client.js";
import type { TransactionClient } from "../_shared/audit.js";
import type {
  ReceiveStockInput,
  ReceiveStockLineResult,
  ReceiveStockResult,
} from "./types.js";

const receiveStock = async (
  input: ReceiveStockInput,
): Promise<ReceiveStockResult> => {
  if (!input.lines.length) {
    throw new Error("At least one line item is required");
  }

  return prisma.$transaction(async (tx) => {
    const config = await tx.tenantInventoryConfig.findUnique({
      where: { tenantId: input.tenantId },
    });
    if (!config) {
      throw new Error(`Tenant ${input.tenantId} has not been onboarded`);
    }

    const variantIds = [...new Set(input.lines.map((l) => l.variantId))];
    const warehouseIds = [...new Set(input.lines.map((l) => l.warehouseId))];
    const binLocationIds = [
      ...new Set(input.lines.map((l) => l.binLocationId).filter(Boolean)),
    ] as string[];

    const [variants, warehouses, binLocations] = await Promise.all([
      tx.productVariant.findMany({
        where: {
          id: { in: variantIds },
          tenantId: input.tenantId,
          deletedAt: null,
        },
      }),
      tx.warehouse.findMany({
        where: {
          id: { in: warehouseIds },
          tenantId: input.tenantId,
          isActive: true,
          deletedAt: null,
        },
      }),
      binLocationIds.length
        ? tx.binLocation.findMany({
            where: {
              id: { in: binLocationIds },
              tenantId: input.tenantId,
              isActive: true,
              deletedAt: null,
            },
          })
        : Promise.resolve([]),
    ]);

    const variantMap = new Map(variants.map((v) => [v.id, v]));
    const warehouseMap = new Map(warehouses.map((w) => [w.id, w]));
    const binLocationMap = new Map(binLocations.map((b) => [b.id, b]));

    for (const line of input.lines) {
      if (!variantMap.has(line.variantId)) {
        throw new Error(`Variant ${line.variantId} not found or deleted`);
      }
      if (!warehouseMap.has(line.warehouseId)) {
        throw new Error(
          `Warehouse ${line.warehouseId} not found, inactive, or deleted`,
        );
      }
      if (line.binLocationId && !binLocationMap.has(line.binLocationId)) {
        throw new Error(
          `Bin location ${line.binLocationId} not found, inactive, or deleted`,
        );
      }
      if (line.quantityReceived <= 0) {
        throw new Error(
          `quantityReceived must be positive for variant ${line.variantId}`,
        );
      }

      const variant = variantMap.get(line.variantId);
      if (!variant) {
        throw new Error(`Variant ${line.variantId} not found or deleted`);
      }
      if (variant.trackingType === "SERIAL") {
        if (!line.serialNumbers?.length) {
          throw new Error(
            `Serial numbers required for SERIAL-tracked variant ${variant.sku}`,
          );
        }
        if (line.serialNumbers.length !== line.quantityReceived) {
          throw new Error(
            `Serial number count (${line.serialNumbers.length}) must match quantityReceived (${line.quantityReceived}) for variant ${variant.sku}`,
          );
        }
      }
    }

    const results: ReceiveStockLineResult[] = [];

    for (const line of input.lines) {
      const variant = variantMap.get(line.variantId);
      if (!variant) {
        throw new Error(`Variant ${line.variantId} not found or deleted`);
      }
      const referenceType = input.referenceType ?? "GOODS_RECEIPT_NOTE";
      const currency = line.unitCostCurrency ?? config.defaultCurrency;

      const lot = await tx.inventoryLot.create({
        data: {
          tenantId: input.tenantId,
          variantId: line.variantId,
          warehouseId: line.warehouseId,
          ...(line.binLocationId && { binLocationId: line.binLocationId }),
          quantityReceived: line.quantityReceived,
          quantityRemaining: line.quantityReceived,
          unitCost: line.unitCost,
          unitCostCurrency: currency,
          receivedAt: input.receivedAt,
          referenceId: input.referenceId,
          referenceType,
          ...(line.lotNumber && { lotNumber: line.lotNumber }),
          ...(line.expiresAt && { expiresAt: line.expiresAt }),
          ...(line.manufacturedAt && { manufacturedAt: line.manufacturedAt }),
          ...(line.notes && { notes: line.notes }),
        },
      });

      let serializedUnits: Awaited<
        ReturnType<typeof tx.serializedUnit.create>
      >[] = [];
      if (variant.trackingType === "SERIAL" && line.serialNumbers?.length) {
        serializedUnits = await Promise.all(
          line.serialNumbers.map((serialNumber) =>
            tx.serializedUnit.create({
              data: {
                tenantId: input.tenantId,
                serialNumber,
                variantId: line.variantId,
                lotId: lot.id,
                status: "AVAILABLE",
              },
            }),
          ),
        );
      }

      const movement = await tx.stockMovement.create({
        data: {
          tenantId: input.tenantId,
          type: "RECEIPT",
          quantity: line.quantityReceived,
          unitCostSnapshot: line.unitCost,
          costCurrency: currency,
          variantId: line.variantId,
          warehouseId: line.warehouseId,
          referenceId: input.referenceId,
          referenceType,
          performedBy: input.performedBy,
        },
      });

      const inventoryItem = await upsertInventoryItem(
        tx,
        input.tenantId,
        line.variantId,
        line.warehouseId,
        line.quantityReceived,
      );

      const alerts = await checkOverstockAlert(
        tx,
        input.tenantId,
        line.variantId,
        line.warehouseId,
        inventoryItem.quantityOnHand,
        inventoryItem.overstockThreshold,
      );

      results.push({ lot, serializedUnits, movement, inventoryItem, alerts });
    }

    return { lines: results };
  });
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

  if (existingAlert) {
    return [];
  }

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

export { receiveStock };
