import { prisma } from "../../client.js";
import type {
  CheckAvailabilityBatchInput,
  CheckAvailabilityBatchResult,
  CheckAvailabilityInput,
  CheckAvailabilityResult,
} from "./types.js";

const checkAvailability = async (
  input: CheckAvailabilityInput,
): Promise<CheckAvailabilityResult> => {
  const item = await prisma.inventoryItem.findUnique({
    where: {
      tenantId_variantId_warehouseId: {
        tenantId: input.tenantId,
        variantId: input.variantId,
        warehouseId: input.warehouseId,
      },
    },
  });

  if (!item) {
    return {
      variantId: input.variantId,
      warehouseId: input.warehouseId,
      quantityOnHand: 0,
      quantityReserved: 0,
      quantityAvailable: 0,
    };
  }

  return {
    variantId: item.variantId,
    warehouseId: item.warehouseId,
    quantityOnHand: item.quantityOnHand,
    quantityReserved: item.quantityReserved,
    quantityAvailable: item.quantityOnHand - item.quantityReserved,
  };
};

const checkAvailabilityBatch = async (
  input: CheckAvailabilityBatchInput,
): Promise<CheckAvailabilityBatchResult> => {
  if (!input.items.length) {
    return { items: [] };
  }

  const items = await prisma.inventoryItem.findMany({
    where: {
      tenantId: input.tenantId,
      OR: input.items.map((i) => ({
        variantId: i.variantId,
        warehouseId: i.warehouseId,
      })),
    },
  });

  const itemMap = new Map(
    items.map((i) => [`${i.variantId}:${i.warehouseId}`, i]),
  );

  const results: CheckAvailabilityResult[] = input.items.map((req) => {
    const item = itemMap.get(`${req.variantId}:${req.warehouseId}`);

    if (!item) {
      return {
        variantId: req.variantId,
        warehouseId: req.warehouseId,
        quantityOnHand: 0,
        quantityReserved: 0,
        quantityAvailable: 0,
      };
    }

    return {
      variantId: item.variantId,
      warehouseId: item.warehouseId,
      quantityOnHand: item.quantityOnHand,
      quantityReserved: item.quantityReserved,
      quantityAvailable: item.quantityOnHand - item.quantityReserved,
    };
  });

  return { items: results };
};

export { checkAvailability, checkAvailabilityBatch };
