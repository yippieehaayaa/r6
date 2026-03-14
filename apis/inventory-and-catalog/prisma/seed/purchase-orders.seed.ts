import { faker } from "@faker-js/faker";
import type { PrismaClient } from "../../generated/client/index.js";

const PO_STATUS_BY_YEAR = {
  past: [
    { weight: 7, value: "RECEIVED" as const },
    { weight: 2, value: "PARTIALLY_RECEIVED" as const },
    { weight: 1, value: "CANCELLED" as const },
  ],
  recent: ["CONFIRMED", "RECEIVED", "PARTIALLY_RECEIVED"] as const,
  current: ["DRAFT", "SENT", "CONFIRMED"] as const,
};

const PO_NOTES = [
  "Priority order — peak season",
  "Restocking after stockout",
  "Bulk discount negotiated",
  "Expedited shipping requested",
  "Seasonal inventory top-up",
] as const;

function poStatusForYear(year: number) {
  if (year <= 2024)
    return faker.helpers.weightedArrayElement(PO_STATUS_BY_YEAR.past);
  if (year === 2025)
    return faker.helpers.arrayElement(PO_STATUS_BY_YEAR.recent);
  return faker.helpers.arrayElement(PO_STATUS_BY_YEAR.current);
}

export async function seedPurchaseOrders(
  prisma: PrismaClient,
  suppliers: { id: string }[],
  warehouses: { id: string }[],
  variants: { id: string }[],
  now: Date,
  log: (msg: string) => void,
): Promise<void> {
  let totalOrders = 0;
  let totalItems = 0;

  for (let year = 2020; year <= 2026; year++) {
    const poCount = year === 2026 ? 5 : 10;
    const yearStart = new Date(`${year}-01-01T00:00:00.000Z`);
    const yearEnd =
      year === 2026 ? now : new Date(`${year}-12-31T23:59:59.000Z`);

    for (let p = 0; p < poCount; p++) {
      const orderDate = faker.date.between({ from: yearStart, to: yearEnd });
      const status = poStatusForYear(year);
      const orderNumber = `PO-${year}-${String(p + 1).padStart(4, "0")}-${faker.string.alphanumeric(4).toUpperCase()}`;

      const po = await prisma.purchaseOrder.upsert({
        where: { orderNumber },
        update: {},
        create: {
          orderNumber,
          status,
          supplierId: faker.helpers.arrayElement(suppliers).id,
          warehouseId: faker.helpers.arrayElement(warehouses).id,
          expectedAt: faker.date.soon({ days: 45, refDate: orderDate }),
          notes: faker.datatype.boolean(0.3)
            ? faker.helpers.arrayElement(PO_NOTES)
            : null,
          createdAt: orderDate,
        },
      });

      const pickedVariants = faker.helpers.arrayElements(variants, {
        min: 3,
        max: 7,
      });

      const items = pickedVariants.map((v) => {
        const ordered = faker.number.int({ min: 20, max: 300 });
        const quantityReceived =
          status === "RECEIVED"
            ? ordered
            : status === "PARTIALLY_RECEIVED"
              ? faker.number.int({ min: 1, max: ordered - 1 })
              : 0;

        return {
          purchaseOrderId: po.id,
          variantId: v.id,
          quantityOrdered: ordered,
          quantityReceived,
          unitCost: faker.number.float({
            min: 2.5,
            max: 650,
            fractionDigits: 2,
          }),
          createdAt: orderDate,
        };
      });

      // MongoDB's createMany doesn't support skipDuplicates — upsert per item for idempotency.
      await Promise.all(
        items.map((item) =>
          prisma.purchaseOrderItem.upsert({
            where: {
              purchaseOrderId_variantId: {
                purchaseOrderId: item.purchaseOrderId,
                variantId: item.variantId,
              },
            },
            update: {},
            create: item,
          }),
        ),
      );

      totalOrders++;
      totalItems += items.length;
    }
  }

  log(
    `${totalOrders} purchase orders with ${totalItems} line items (2020 → present)`,
  );
}
