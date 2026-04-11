import { prisma } from "../../client.js";
import type { TransactionClient } from "../_shared/audit.js";
import type {
  PrepareStockCountInput,
  PrepareStockCountResult,
  StockCountItemScope,
} from "./types.js";

const prepareStockCount = async (
  input: PrepareStockCountInput,
): Promise<PrepareStockCountResult> => {
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

    const stockCount = await tx.stockCount.create({
      data: {
        tenantId: input.tenantId,
        countType: input.countType ?? "CYCLE",
        status: "DRAFT",
        performedBy: input.performedBy,
        warehouseId: input.warehouseId,
        ...(input.notes && { notes: input.notes }),
      },
    });

    const items = input.items?.length
      ? await createScopedItems(
          tx,
          input.tenantId,
          stockCount.id,
          input.warehouseId,
          input.items,
        )
      : await createFullWarehouseItems(
          tx,
          input.tenantId,
          stockCount.id,
          input.warehouseId,
        );

    if (!items.length) {
      throw new Error(
        `No inventory items found in warehouse ${input.warehouseId} for the given scope`,
      );
    }

    return { stockCount, items };
  });
};

const createScopedItems = async (
  tx: TransactionClient,
  tenantId: string,
  stockCountId: string,
  warehouseId: string,
  scope: StockCountItemScope[],
) => {
  const results = [];

  for (const s of scope) {
    let quantityExpected: number;

    if (s.lotId) {
      const lot = await tx.inventoryLot.findFirst({
        where: { id: s.lotId, tenantId, warehouseId, deletedAt: null },
      });
      if (!lot) {
        throw new Error(`Lot ${s.lotId} not found in warehouse ${warehouseId}`);
      }
      quantityExpected = lot.quantityRemaining;
    } else {
      const item = await tx.inventoryItem.findUnique({
        where: {
          tenantId_variantId_warehouseId: {
            tenantId,
            variantId: s.variantId,
            warehouseId,
          },
        },
      });
      quantityExpected = item?.quantityOnHand ?? 0;
    }

    const countItem = await tx.stockCountItem.create({
      data: {
        tenantId,
        stockCountId,
        variantId: s.variantId,
        quantityExpected,
        ...(s.lotId && { lotId: s.lotId }),
        ...(s.binLocationId && { binLocationId: s.binLocationId }),
      },
    });
    results.push(countItem);
  }

  return results;
};

const createFullWarehouseItems = async (
  tx: TransactionClient,
  tenantId: string,
  stockCountId: string,
  warehouseId: string,
) => {
  const inventoryItems = await tx.inventoryItem.findMany({
    where: { tenantId, warehouseId, deletedAt: null },
  });

  const results = [];
  for (const item of inventoryItems) {
    const countItem = await tx.stockCountItem.create({
      data: {
        tenantId,
        stockCountId,
        variantId: item.variantId,
        quantityExpected: item.quantityOnHand,
      },
    });
    results.push(countItem);
  }
  return results;
};

export { prepareStockCount };
