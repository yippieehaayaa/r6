import type { PrismaClient } from "../../generated/client/index.js";

type CategoryDef = {
  name: string;
  slug: string;
  children: { name: string; slug: string }[];
};

const CATEGORY_DEFS: CategoryDef[] = [
  {
    name: "Electronics",
    slug: "electronics",
    children: [
      { name: "Smartphones", slug: "electronics-smartphones" },
      { name: "Laptops & Computers", slug: "electronics-laptops" },
      { name: "Audio & Headphones", slug: "electronics-audio" },
    ],
  },
  {
    name: "Apparel",
    slug: "apparel",
    children: [
      { name: "Men's Clothing", slug: "apparel-mens" },
      { name: "Women's Clothing", slug: "apparel-womens" },
      { name: "Footwear", slug: "apparel-footwear" },
    ],
  },
  {
    name: "Home & Garden",
    slug: "home-garden",
    children: [
      { name: "Furniture", slug: "home-furniture" },
      { name: "Kitchen & Dining", slug: "home-kitchen" },
    ],
  },
  { name: "Sports & Outdoors", slug: "sports-outdoors", children: [] },
  { name: "Beauty & Health", slug: "beauty-health", children: [] },
  { name: "Toys & Games", slug: "toys-games", children: [] },
  { name: "Automotive", slug: "automotive", children: [] },
  { name: "Office & Stationery", slug: "office-stationery", children: [] },
];

/** Slugs of categories that have children — used externally to filter leaf nodes. */
export const PARENT_CATEGORY_SLUGS = new Set(
  CATEGORY_DEFS.filter((d) => d.children.length > 0).map((d) => d.slug),
);

export async function seedCategories(
  prisma: PrismaClient,
  tenantSlug: string,
  log: (msg: string) => void,
): Promise<{ id: string; slug: string }[]> {
  const result: { id: string; slug: string }[] = [];

  for (let i = 0; i < CATEGORY_DEFS.length; i++) {
    const def = CATEGORY_DEFS[i];
    const parent = await prisma.category.upsert({
      where: { tenantSlug_slug: { tenantSlug, slug: def.slug } },
      update: {},
      create: {
        tenantSlug,
        name: def.name,
        slug: def.slug,
        isActive: true,
        sortOrder: i,
      },
    });
    result.push(parent);

    for (let j = 0; j < def.children.length; j++) {
      const child = def.children[j];
      const childDoc = await prisma.category.upsert({
        where: { tenantSlug_slug: { tenantSlug, slug: child.slug } },
        update: {},
        create: {
          tenantSlug,
          name: child.name,
          slug: child.slug,
          parentId: parent.id,
          isActive: true,
          sortOrder: j,
        },
      });
      result.push(childDoc);
    }
  }

  const parentCount = CATEGORY_DEFS.filter((d) => d.children.length > 0).length;
  log(`${result.length} categories (${parentCount} with sub-categories)`);
  return result;
}
