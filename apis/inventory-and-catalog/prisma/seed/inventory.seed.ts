import { faker } from "@faker-js/faker";
import type { Prisma, PrismaClient } from "../../generated/client/index.js";

const ADJUSTMENT_NOTES = [
  "Annual stock count adjustment",
  "Customer return — restocked",
  "Damaged in transit — written off",
  "Cycle count correction",
  "Supplier overshipment adjustment",
  "Returned — quality passed",
  "Write-off approved by ops",
  "Shrinkage — quarterly audit",
] as const;

function buildMovementsForVariantWarehouse(
  tenantSlug: string,
  variantId: string,
  warehouseId: string,
  epoch: Date,
  now: Date,
): Prisma.StockMovementCreateManyInput[] {
  const movements: Prisma.StockMovementCreateManyInput[] = [];

  // Opening stock
  movements.push({
    tenantSlug,
    type: "RECEIPT",
    quantity: faker.number.int({ min: 150, max: 500 }),
    variantId,
    warehouseId,
    performedBy: "system-migration",
    notes: "Opening stock — January 2020",
    referenceType: null,
    referenceId: null,
    createdAt: new Date("2020-01-15T08:00:00.000Z"),
  });

  // Quarterly receipts and sales from April 2020 → now
  let cursor = new Date("2020-04-01T00:00:00.000Z");
  while (cursor < now) {
    const quarterEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 3, 0);
    const windowEnd = quarterEnd < now ? quarterEnd : now;

    movements.push({
      tenantSlug,
      type: "RECEIPT",
      quantity: faker.number.int({ min: 50, max: 250 }),
      variantId,
      warehouseId,
      performedBy: "procurement",
      notes: null,
      referenceType: "PURCHASE_ORDER",
      referenceId: null,
      createdAt: faker.date.between({ from: cursor, to: windowEnd }),
    });

    movements.push({
      tenantSlug,
      type: "SALE",
      quantity: -faker.number.int({ min: 10, max: 90 }),
      variantId,
      warehouseId,
      performedBy: "sales-system",
      notes: null,
      referenceType: "SALE_ORDER",
      referenceId: faker.string.alphanumeric(12).toUpperCase(),
      createdAt: faker.date.between({ from: cursor, to: windowEnd }),
    });

    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 3, 1);
  }

  // Random adjustments, returns, damages
  const adjTypes = ["ADJUSTMENT", "RETURN", "DAMAGE"] as const;
  const adjCount = faker.number.int({ min: 3, max: 8 });
  for (let i = 0; i < adjCount; i++) {
    const adjType = faker.helpers.arrayElement(adjTypes);
    movements.push({
      tenantSlug,
      type: adjType,
      quantity:
        adjType === "RETURN"
          ? faker.number.int({ min: 1, max: 20 })
          : -faker.number.int({ min: 1, max: 15 }),
      variantId,
      warehouseId,
      performedBy: "warehouse-manager",
      notes: faker.helpers.arrayElement(ADJUSTMENT_NOTES),
      referenceType: null,
      referenceId: null,
      createdAt: faker.date.between({ from: epoch, to: now }),
    });
  }

  return movements;
}

export async function seedInventory(
  prisma: PrismaClient,
  tenantSlug: string,
  variants: { id: string }[],
  warehouses: { id: string }[],
  epoch: Date,
  now: Date,
  isFresh: boolean,
  log: (msg: string) => void,
): Promise<void> {
  // MongoDB's createMany does not support skipDuplicates — use parallel upserts for idempotency.
  await Promise.all(
    variants.flatMap((variant) =>
      warehouses.map((warehouse) => {
        const quantityOnHand = faker.number.int({ min: 30, max: 400 });
        const quantityReserved = faker.number.int({
          min: 0,
          max: Math.max(1, Math.floor(quantityOnHand * 0.1)),
        });
        return prisma.inventoryItem.upsert({
          where: {
            tenantSlug_variantId_warehouseId: {
              tenantSlug,
              variantId: variant.id,
              warehouseId: warehouse.id,
            },
          },
          update: {},
          create: {
            tenantSlug,
            variantId: variant.id,
            warehouseId: warehouse.id,
            quantityOnHand,
            quantityReserved,
            reorderPoint: faker.number.int({ min: 10, max: 40 }),
            reorderQuantity: faker.number.int({ min: 50, max: 200 }),
          },
        });
      }),
    ),
  );

  // Stock movements are append-only and have no unique key.
  // Skip insertion on re-runs to prevent duplicating the audit log.
  const existingMovementCount = isFresh
    ? 0
    : await prisma.stockMovement.count();

  if (existingMovementCount === 0) {
    const allMovements = variants.flatMap((variant) =>
      warehouses.flatMap((warehouse) =>
        buildMovementsForVariantWarehouse(
          tenantSlug,
          variant.id,
          warehouse.id,
          epoch,
          now,
        ),
      ),
    );
    await prisma.stockMovement.createMany({ data: allMovements }); // append-only; no unique key — guarded by count check above
    log(`${allMovements.length} stock movements (2020 → present)`);
  } else {
    log(`stock movements skipped — ${existingMovementCount} already exist`);
  }

  log(`${variants.length * warehouses.length} inventory items`);
}
