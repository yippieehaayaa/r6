import { PrismaClient } from "../../generated/client/index.js";

const prisma = new PrismaClient();

async function migrateProductVariants() {
  console.log("  → Migrating product_variants monetary fields to centavos");

  const result = await prisma.$runCommandRaw({
    update: "product_variants",
    updates: [
      {
        q: {
          price: { $type: "double" },
        },
        u: [
          {
            $set: {
              price: {
                $round: [{ $multiply: ["$price", 100] }, 0],
              },
            },
          },
        ],
        multi: true,
      },
      {
        q: {
          costPrice: { $type: "double" },
        },
        u: [
          {
            $set: {
              costPrice: {
                $round: [{ $multiply: ["$costPrice", 100] }, 0],
              },
            },
          },
        ],
        multi: true,
      },
      {
        q: {
          compareAtPrice: { $type: "double" },
        },
        u: [
          {
            $set: {
              compareAtPrice: {
                $round: [{ $multiply: ["$compareAtPrice", 100] }, 0],
              },
            },
          },
        ],
        multi: true,
      },
    ],
  });

  console.log("    result:", JSON.stringify(result));
}

async function migratePurchaseOrderItems() {
  console.log("  → Migrating purchase_order_items unitCost to centavos");

  const result = await prisma.$runCommandRaw({
    update: "purchase_order_items",
    updates: [
      {
        q: {
          unitCost: { $type: "double" },
        },
        u: [
          {
            $set: {
              unitCost: {
                $round: [{ $multiply: ["$unitCost", 100] }, 0],
              },
            },
          },
        ],
        multi: true,
      },
    ],
  });

  console.log("    result:", JSON.stringify(result));
}

async function main() {
  console.log(
    "\n── Migrating monetary fields to centavos ────────────────────────",
  );

  await migrateProductVariants();
  await migratePurchaseOrderItems();

  console.log(
    "\n── Migration completed ──────────────────────────────────────────\n",
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
