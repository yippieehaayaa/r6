import { prisma } from "../../client.js";
import type { RequestReturnInput, RequestReturnResult } from "./types.js";

const requestReturn = async (
  input: RequestReturnInput,
): Promise<RequestReturnResult> => {
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
    const lotIds = [
      ...new Set(input.lines.map((l) => l.lotId).filter(Boolean)),
    ] as string[];

    const [variants, lots] = await Promise.all([
      tx.productVariant.findMany({
        where: {
          id: { in: variantIds },
          tenantId: input.tenantId,
          deletedAt: null,
        },
      }),
      lotIds.length
        ? tx.inventoryLot.findMany({
            where: {
              id: { in: lotIds },
              tenantId: input.tenantId,
              deletedAt: null,
            },
          })
        : Promise.resolve([]),
    ]);

    const variantMap = new Map(variants.map((v) => [v.id, v]));
    const lotMap = new Map(lots.map((l) => [l.id, l]));

    for (const line of input.lines) {
      const variant = variantMap.get(line.variantId);
      if (!variant) {
        throw new Error(`Variant ${line.variantId} not found or deleted`);
      }
      if (line.quantityReturned <= 0) {
        throw new Error(
          `quantityReturned must be positive for variant ${line.variantId}`,
        );
      }
      if (line.lotId && !lotMap.has(line.lotId)) {
        throw new Error(`Lot ${line.lotId} not found or deleted`);
      }
      if (variant.trackingType === "SERIAL" && !line.serialNumber) {
        throw new Error(
          `serialNumber is required for SERIAL-tracked variant ${variant.sku}`,
        );
      }
    }

    const returnRequest = await tx.returnRequest.create({
      data: {
        tenantId: input.tenantId,
        status: "REQUESTED",
        performedBy: input.performedBy,
        referenceId: input.referenceId,
        referenceType: input.referenceType,
        ...(input.returnReason && { returnReason: input.returnReason }),
      },
    });

    const items = await Promise.all(
      input.lines.map((line) =>
        tx.returnRequestItem.create({
          data: {
            tenantId: input.tenantId,
            returnRequestId: returnRequest.id,
            variantId: line.variantId,
            quantityReturned: line.quantityReturned,
            disposition: line.disposition,
            ...(line.lotId && { lotId: line.lotId }),
            ...(line.serialNumber && { serialNumber: line.serialNumber }),
            ...(line.dispositionNotes && {
              dispositionNotes: line.dispositionNotes,
            }),
          },
        }),
      ),
    );

    return { returnRequest, items };
  });
};

export { requestReturn };
