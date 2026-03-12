import { faker } from "@faker-js/faker";
import { PrismaClient } from "../../generated/client/index.js";
import { seedBrands } from "./brands.seed.js";
import { seedCategories } from "./categories.seed.js";
import { seedInventory } from "./inventory.seed.js";
import { seedProducts } from "./products.seed.js";
import { seedPurchaseOrders } from "./purchase-orders.seed.js";
import { seedSeasons } from "./seasons.seed.js";
import { seedSuppliers } from "./suppliers.seed.js";
import { seedWarehouses } from "./warehouses.seed.js";

faker.seed(2020);

const prisma = new PrismaClient();
const log = (msg: string) => console.log(`  ✓ ${msg}`);
const isFresh = process.argv.includes("--fresh");

const EPOCH = new Date("2020-01-01T00:00:00.000Z");
const NOW = new Date();

async function clearDatabase(): Promise<void> {
  console.log("\n── Clearing existing data ───────────────────────");
  await prisma.stockMovement.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.purchaseOrderItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.category.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.season.deleteMany();
  log("all collections cleared");
}

async function main(): Promise<void> {
  if (isFresh) await clearDatabase();

  console.log("\n── Categories ──────────────────────────────────");
  const categories = await seedCategories(prisma, log);

  console.log("\n── Brands · Warehouses · Suppliers · Seasons ───");
  const [brands, warehouses, suppliers] = await Promise.all([
    seedBrands(prisma, log),
    seedWarehouses(prisma, log),
    seedSuppliers(prisma, log),
    seedSeasons(prisma, log),
  ]);

  console.log("\n── Products & Variants ─────────────────────────");
  const variants = await seedProducts(
    prisma,
    categories,
    brands,
    EPOCH,
    NOW,
    log,
  );

  console.log("\n── Inventory & Stock Movements ─────────────────");
  await seedInventory(prisma, variants, warehouses, EPOCH, NOW, isFresh, log);

  console.log("\n── Purchase Orders ─────────────────────────────");
  await seedPurchaseOrders(prisma, suppliers, warehouses, variants, NOW, log);

  console.log("\n── Done ─────────────────────────────────────────\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
