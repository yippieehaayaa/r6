import { prisma } from "../../client.js";
import type { TransactionClient } from "../_shared/audit.js";
import type {
  FulfillSaleInput,
  FulfillSaleLineResult,
  FulfillSaleResult,
  LotConsumption,
} from "./types.js";

const fulfillSale = async (
  input: FulfillSaleInput,
): Promise<FulfillSaleResult> => {
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
      const variant = variantMap.get(line.variantId);
      if (variant?.trackingType === "SERIAL") {
        if (!line.serialNumbers?.length) {
          throw new Error(
            `Serial numbers required for SERIAL-tracked variant ${variant.sku}`,
          );
        }
        if (line.serialNumbers.length !== line.quantity) {
          throw new Error(
            `Serial number count (${line.serialNumbers.length}) must match quantity (${line.quantity}) for variant ${variant.sku}`,
          );
        }
      }
    }

    const referenceType = input.referenceType ?? "SALE_TRANSACTION";
    const results: FulfillSaleLineResult[] = [];

    for (const line of input.lines) {
      const variant = variantMap.get(line.variantId);

      const lotConsumptions = await depleteLots(
        tx,
        input.tenantId,
        line.variantId,
        line.warehouseId,
        line.quantity,
        config.costingMethod,
        input.referenceId,
        referenceType,
        input.performedBy,
      );

      let serializedUnits: Awaited<
        ReturnType<typeof tx.serializedUnit.update>
      >[] = [];
      if (variant?.trackingType === "SERIAL" && line.serialNumbers?.length) {
        const existingUnits = await tx.serializedUnit.findMany({
          where: {
            tenantId: input.tenantId,
            variantId: line.variantId,
            serialNumber: { in: line.serialNumbers },
          },
        });
        const unitMap = new Map(existingUnits.map((u) => [u.serialNumber, u]));
        for (const sn of line.serialNumbers) {
          const unit = unitMap.get(sn);
          if (!unit) {
            throw new Error(
              `Serial number ${sn} not found for variant ${line.variantId}`,
            );
          }
          if (unit.status !== "AVAILABLE") {
            throw new Error(
              `Serial number ${sn} is not available (status: ${unit.status})`,
            );
          }
        }
        serializedUnits = await Promise.all(
          line.serialNumbers.map((serialNumber) =>
            tx.serializedUnit.update({
              where: {
                tenantId_serialNumber: {
                  tenantId: input.tenantId,
                  serialNumber,
                },
              },
              data: {
                status: "SOLD",
                saleReferenceId: input.referenceId,
              },
            }),
          ),
        );
      }

      const hasReservation = !!line.reservationId;
      const inventoryItem = await tx.inventoryItem.update({
        where: {
          tenantId_variantId_warehouseId: {
            tenantId: input.tenantId,
            variantId: line.variantId,
            warehouseId: line.warehouseId,
          },
        },
        data: {
          quantityOnHand: { decrement: line.quantity },
          ...(hasReservation && {
            quantityReserved: { decrement: line.quantity },
          }),
        },
      });

      let reservation = null;
      if (line.reservationId) {
        const existing = await tx.stockReservation.findUnique({
          where: { id: line.reservationId },
        });
        if (!existing || existing.status !== "ACTIVE") {
          throw new Error(
            `Reservation ${line.reservationId} not found or not active`,
          );
        }
        reservation = await tx.stockReservation.update({
          where: { id: line.reservationId },
          data: {
            status: "FULFILLED",
            fulfilledAt: new Date(),
          },
        });
      }

      const quantityAvailable =
        inventoryItem.quantityOnHand - inventoryItem.quantityReserved;
      const alerts = await checkLowStockAlert(
        tx,
        input.tenantId,
        line.variantId,
        line.warehouseId,
        quantityAvailable,
        inventoryItem.reorderPoint,
      );

      results.push({
        lotConsumptions,
        serializedUnits,
        inventoryItem,
        reservation,
        alerts,
      });
    }

    return { lines: results };
  });
};

const depleteLots = async (
  tx: TransactionClient,
  tenantId: string,
  variantId: string,
  warehouseId: string,
  quantity: number,
  costingMethod: string,
  referenceId: string,
  referenceType: string,
  performedBy: string,
): Promise<LotConsumption[]> => {
  const orderBy =
    costingMethod === "FEFO"
      ? [
          { expiresAt: { sort: "asc" as const, nulls: "last" as const } },
          { receivedAt: "asc" as const },
        ]
      : [{ receivedAt: "asc" as const }];

  const activeLots = await tx.inventoryLot.findMany({
    where: {
      tenantId,
      variantId,
      warehouseId,
      quantityRemaining: { gt: 0 },
      isQuarantined: false,
    },
    orderBy,
  });

  const totalAvailable = activeLots.reduce(
    (sum, lot) => sum + lot.quantityRemaining,
    0,
  );
  if (totalAvailable < quantity) {
    throw new Error(
      `Insufficient lot stock for variant ${variantId} at warehouse ${warehouseId}: available=${totalAvailable}, requested=${quantity}`,
    );
  }

  let avcoUnitCost: string | null = null;
  if (costingMethod === "AVCO") {
    const totalCostTimesQty = activeLots.reduce(
      (sum, lot) => sum + Number(lot.unitCost) * lot.quantityRemaining,
      0,
    );
    avcoUnitCost = (totalCostTimesQty / totalAvailable).toFixed(4);
  }

  let remaining = quantity;
  const results: LotConsumption[] = [];

  for (const lot of activeLots) {
    if (remaining <= 0) break;

    const depleteQty = Math.min(remaining, lot.quantityRemaining);
    const unitCostSnapshot =
      costingMethod === "AVCO"
        ? (avcoUnitCost as string)
        : String(lot.unitCost);

    const updatedLot = await tx.inventoryLot.update({
      where: { id: lot.id },
      data: { quantityRemaining: { decrement: depleteQty } },
    });

    const movement = await tx.stockMovement.create({
      data: {
        tenantId,
        type: "SALE",
        quantity: -depleteQty,
        unitCostSnapshot,
        costCurrency: lot.unitCostCurrency,
        referenceId,
        referenceType,
        performedBy,
        variantId,
        warehouseId,
        lotId: lot.id,
      },
    });

    results.push({ lot: updatedLot, movement, quantityDepleted: depleteQty });
    remaining -= depleteQty;
  }

  return results;
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

  if (existingAlert) {
    return [];
  }

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

export { fulfillSale };
