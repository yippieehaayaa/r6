import { faker } from "@faker-js/faker";
import type { PrismaClient } from "../../generated/client/index.js";
import { PARENT_CATEGORY_SLUGS } from "./categories.seed.js";

const VARIANT_OPTION_SETS = [
  [{ color: "Black" }, { color: "White" }, { color: "Silver" }],
  [{ size: "S" }, { size: "M" }, { size: "L" }, { size: "XL" }],
  [{ color: "Midnight Blue" }, { color: "Forest Green" }, { color: "Crimson" }],
  [{ model: "Standard" }, { model: "Pro" }, { model: "Elite" }],
  [{ color: "Titanium" }, { color: "Rose Gold" }],
  [{ size: "XS" }, { size: "S" }, { size: "M" }, { size: "L" }],
  [{ finish: "Matte" }, { finish: "Gloss" }],
  [{ variant: "Classic" }, { variant: "Sport" }, { variant: "Premium" }],
];

const PRODUCTS_PER_LEAF_CATEGORY = 6;

export async function seedProducts(
  prisma: PrismaClient,
  tenantSlug: string,
  categories: { id: string; slug: string }[],
  brands: { id: string }[],
  epoch: Date,
  now: Date,
  log: (msg: string) => void,
): Promise<{ id: string }[]> {
  const leafCategories = categories.filter(
    (c) => !PARENT_CATEGORY_SLUGS.has(c.slug),
  );
  const allVariants: { id: string }[] = [];

  for (const category of leafCategories) {
    for (let i = 0; i < PRODUCTS_PER_LEAF_CATEGORY; i++) {
      const sku = faker.string.alphanumeric(8).toUpperCase();
      const name = faker.commerce.productName();
      const slugBase = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      const createdAt = faker.date.between({ from: epoch, to: now });

      const product = await prisma.product.upsert({
        where: { tenantSlug_sku: { tenantSlug, sku } },
        update: {},
        create: {
          tenantSlug,
          sku,
          name,
          slug: `${slugBase}-${sku.toLowerCase()}`,
          description: faker.commerce.productDescription(),
          tags: faker.helpers.arrayElements(
            [
              "new",
              "sale",
              "featured",
              "clearance",
              "bestseller",
              "limited",
              "bundle",
              "eco",
            ],
            { min: 1, max: 3 },
          ),
          status: faker.helpers.weightedArrayElement([
            { weight: 8, value: "ACTIVE" as const },
            { weight: 1, value: "DISCONTINUED" as const },
            { weight: 1, value: "ARCHIVED" as const },
          ]),
          categoryId: category.id,
          brandId: faker.helpers.arrayElement(brands).id,
          metadata: {
            weight: faker.number.float({
              min: 0.1,
              max: 15,
              fractionDigits: 2,
            }),
            dimensions: `${faker.number.int({ min: 5, max: 60 })}x${faker.number.int({ min: 5, max: 60 })}x${faker.number.int({ min: 1, max: 40 })} cm`,
            countryOfOrigin: faker.helpers.arrayElement([
              "US",
              "CN",
              "DE",
              "JP",
              "VN",
              "IN",
              "KR",
            ]),
            warrantyMonths: faker.helpers.arrayElement([6, 12, 24, 36]),
          },
          createdAt,
        },
      });

      const optionSet = faker.helpers.arrayElement(VARIANT_OPTION_SETS);
      const variantCount = faker.number.int({
        min: 1,
        max: Math.min(3, optionSet.length),
      });

      for (let k = 0; k < variantCount; k++) {
        const option = optionSet[k];
        const optionVal = Object.values(option)[0] as string;
        const vSku = `${sku}-${optionVal
          .replace(/[^a-z0-9]/gi, "")
          .toUpperCase()
          .slice(0, 5)}`;

        const price = faker.number.float({
          min: 9.99,
          max: 1299.99,
          fractionDigits: 2,
        });

        const variant = await prisma.productVariant.upsert({
          where: { tenantSlug_sku: { tenantSlug, sku: vSku } },
          update: {},
          create: {
            tenantSlug,
            sku: vSku,
            name: `${name} — ${optionVal}`,
            options: option,
            price,
            costPrice: faker.number.float({
              min: price * 0.3,
              max: price * 0.7,
              fractionDigits: 2,
            }),
            compareAtPrice: faker.datatype.boolean(0.3)
              ? faker.number.float({ min: 1300, max: 1800, fractionDigits: 2 })
              : undefined,
            weight: faker.number.float({
              min: 0.1,
              max: 8,
              fractionDigits: 2,
            }),
            length: faker.number.float({ min: 5, max: 60, fractionDigits: 1 }),
            width: faker.number.float({ min: 5, max: 60, fractionDigits: 1 }),
            height: faker.number.float({ min: 1, max: 40, fractionDigits: 1 }),
            dimensionUnit: "CM",
            weightUnit: "KG",
            currency: "PHP",
            isActive: true,
            productId: product.id,
            createdAt,
          },
        });
        allVariants.push(variant);
      }
    }
  }

  log(
    `${allVariants.length} variants across ${leafCategories.length} leaf categories`,
  );
  return allVariants;
}
