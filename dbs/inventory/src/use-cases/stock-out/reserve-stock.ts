import { prisma } from "../../client.js";
import type { TransactionClient } from "../_shared/audit.js";
import type {
  ReserveStockInput,
  ReserveStockLineResult,
  ReserveStockResult,
} from "./types.js";

const reserveStock = async (
  input: ReserveStockInput,
): Promise<ReserveStockResult> => {
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

    const [variants, warehouses] = await Promise.all([
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
    ]);

    const variantMap = new Map(variants.map((v) => [v.id, v]));
    const warehouseMap = new Map(warehouses.map((w) => [w.id, w]));

    for (const line of input.lines) {
      if (!variantMap.has(line.variantId)) {
        throw new Error(`Variant ${line.variantId} not found or deleted`);
      }
      if (!warehouseMap.has(line.warehouseId)) {
        throw new Error(
          `Warehouse ${line.warehouseId} not found, inactive, or deleted`,
        );
      }
      if (line.quantity <= 0) {
        throw new Error(
          `quantity must be positive for variant ${line.variantId}`,
        );
      }
    }

    const expiresAt = new Date(
      Date.now() + config.cartReservationTtlMinutes * 60_000,
    );

    const results: ReserveStockLineResult[] = [];

    for (const line of input.lines) {
      const item = await tx.inventoryItem.findUnique({
        where: {
          tenantId_variantId_warehouseId: {
            tenantId: input.tenantId,
            variantId: line.variantId,
            warehouseId: line.warehouseId,
          },
        },
      });

      const quantityAvailable = item
        ? item.quantityOnHand - item.quantityReserved
        : 0;

      if (quantityAvailable < line.quantity) {
        throw new Error(
          `Insufficient stock for variant ${line.variantId} at warehouse ${line.warehouseId}: available=${quantityAvailable}, requested=${line.quantity}`,
        );
      }

      const reservation = await tx.stockReservation.create({
        data: {
          tenantId: input.tenantId,
          quantity: line.quantity,
          status: "ACTIVE",
          expiresAt,
          referenceId: input.referenceId,
          referenceType: input.referenceType,
          reservedBy: input.reservedBy,
          variantId: line.variantId,
          warehouseId: line.warehouseId,
        },
      });

      const movement = await tx.stockMovement.create({
        data: {
          tenantId: input.tenantId,
          type: "RESERVATION",
          quantity: -line.quantity,
          referenceId: input.referenceId,
          referenceType: input.referenceType,
          performedBy: input.reservedBy,
          variantId: line.variantId,
          warehouseId: line.warehouseId,
        },
      });

      const inventoryItem = await tx.inventoryItem.update({
        where: {
          tenantId_variantId_warehouseId: {
            tenantId: input.tenantId,
            variantId: line.variantId,
            warehouseId: line.warehouseId,
          },
        },
        data: { quantityReserved: { increment: line.quantity } },
      });

      await checkLowStockAlert(
        tx,
        input.tenantId,
        line.variantId,
        line.warehouseId,
        inventoryItem.quantityOnHand - inventoryItem.quantityReserved,
        inventoryItem.reorderPoint,
      );

      results.push({ reservation, movement, inventoryItem });
    }

    return { lines: results };
  });
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
    return;
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

  if (existingAlert) {
    return;
  }

  await tx.stockAlert.create({
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
};

export { reserveStock };
