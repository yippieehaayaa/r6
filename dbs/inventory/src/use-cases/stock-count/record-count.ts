import { prisma } from "../../client.js";
import type { RecordCountInput, RecordCountResult } from "./types.js";

const recordCount = async (
  input: RecordCountInput,
): Promise<RecordCountResult> => {
  if (!input.lines.length) {
    throw new Error("At least one count line is required");
  }

  return prisma.$transaction(async (tx) => {
    const config = await tx.tenantInventoryConfig.findUnique({
      where: { tenantId: input.tenantId },
    });
    if (!config) {
      throw new Error(`Tenant ${input.tenantId} has not been onboarded`);
    }

    const stockCount = await tx.stockCount.findFirst({
      where: {
        id: input.stockCountId,
        tenantId: input.tenantId,
        deletedAt: null,
      },
    });
    if (!stockCount) {
      throw new Error(`Stock count ${input.stockCountId} not found`);
    }
    if (stockCount.status !== "DRAFT" && stockCount.status !== "IN_PROGRESS") {
      throw new Error(
        `Stock count ${input.stockCountId} cannot accept counts (status: ${stockCount.status})`,
      );
    }

    const existingItems = await tx.stockCountItem.findMany({
      where: { stockCountId: input.stockCountId, tenantId: input.tenantId },
    });
    const itemMap = new Map(existingItems.map((i) => [i.id, i]));

    for (const line of input.lines) {
      if (!itemMap.has(line.stockCountItemId)) {
        throw new Error(
          `Stock count item ${line.stockCountItemId} not found on count ${input.stockCountId}`,
        );
      }
      if (line.quantityActual < 0) {
        throw new Error(
          `quantityActual must not be negative for item ${line.stockCountItemId}`,
        );
      }
    }

    const updatedItems = await Promise.all(
      input.lines.map((line) => {
        const existing = itemMap.get(line.stockCountItemId);
        if (!existing) {
          throw new Error(
            `Stock count item ${line.stockCountItemId} not found on count ${input.stockCountId}`,
          );
        }
        const variance = line.quantityActual - existing.quantityExpected;
        return tx.stockCountItem.update({
          where: { id: line.stockCountItemId },
          data: { quantityActual: line.quantityActual, variance },
        });
      }),
    );

    const updatedStockCount =
      stockCount.status === "DRAFT"
        ? await tx.stockCount.update({
            where: { id: stockCount.id },
            data: { status: "IN_PROGRESS", startedAt: new Date() },
          })
        : stockCount;

    return { stockCount: updatedStockCount, items: updatedItems };
  });
};

export { recordCount };
