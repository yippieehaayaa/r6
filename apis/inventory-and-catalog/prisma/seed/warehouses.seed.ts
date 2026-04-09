import type { PrismaClient } from "../../generated/client/index.js";

const WAREHOUSE_DEFS = [
  {
    name: "Main Distribution Center",
    code: "WH-MAIN",
    city: "Los Angeles",
    state: "CA",
  },
  {
    name: "East Coast Fulfillment",
    code: "WH-EAST",
    city: "Newark",
    state: "NJ",
  },
  { name: "Central Hub", code: "WH-CENT", city: "Chicago", state: "IL" },
];

export async function seedWarehouses(
  prisma: PrismaClient,
  tenantSlug: string,
  log: (msg: string) => void,
): Promise<{ id: string }[]> {
  const warehouses = await Promise.all(
    WAREHOUSE_DEFS.map((def) =>
      prisma.warehouse.upsert({
        where: { tenantSlug_code: { tenantSlug, code: def.code } },
        update: {},
        create: {
          tenantSlug,
          name: def.name,
          code: def.code,
          address: { country: "US", city: def.city, state: def.state },
          isActive: true,
        },
      }),
    ),
  );
  log(`${warehouses.length} warehouses`);
  return warehouses;
}
