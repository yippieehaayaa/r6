import { faker } from "@faker-js/faker";
import type { PrismaClient } from "../../generated/client/index.js";

const SUPPLIER_DEFS = [
  {
    name: "GlobalSource Imports",
    code: "SUP-001",
    contactEmail: "orders@globalsource.example",
  },
  {
    name: "Pacific Rim Trading",
    code: "SUP-002",
    contactEmail: "procurement@pacificrim.example",
  },
  {
    name: "Continental Distributors",
    code: "SUP-003",
    contactEmail: "sales@continental.example",
  },
  {
    name: "Sunrise Manufacturing",
    code: "SUP-004",
    contactEmail: "supply@sunrise.example",
  },
  {
    name: "Meridian Wholesale",
    code: "SUP-005",
    contactEmail: "orders@meridian.example",
  },
  {
    name: "Apex Supply Chain",
    code: "SUP-006",
    contactEmail: "trade@apexsupply.example",
  },
  {
    name: "Northern Logistics",
    code: "SUP-007",
    contactEmail: "sales@northernlogistics.example",
  },
  {
    name: "BlueSky Vendors",
    code: "SUP-008",
    contactEmail: "orders@bluesky.example",
  },
  {
    name: "Coastal Goods Co.",
    code: "SUP-009",
    contactEmail: "procure@coastalgoods.example",
  },
  {
    name: "Metro Trade Group",
    code: "SUP-010",
    contactEmail: "supply@metrotrade.example",
  },
];

export async function seedSuppliers(
  prisma: PrismaClient,
  log: (msg: string) => void,
): Promise<{ id: string }[]> {
  const suppliers = await Promise.all(
    SUPPLIER_DEFS.map((def) =>
      prisma.supplier.upsert({
        where: { code: def.code },
        update: {},
        create: {
          name: def.name,
          code: def.code,
          contactEmail: def.contactEmail,
          contactName: faker.person.fullName(),
          contactPhone: faker.phone.number(),
          address: {
            country: faker.helpers.arrayElement([
              "US",
              "CN",
              "DE",
              "JP",
              "KR",
              "VN",
            ]),
            city: faker.location.city(),
          },
          isActive: true,
        },
      }),
    ),
  );
  log(`${suppliers.length} suppliers`);
  return suppliers;
}
