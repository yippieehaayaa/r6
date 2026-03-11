import { faker } from "@faker-js/faker";
import { PrismaClient } from "../../generated/client/index.js";

faker.seed(2020);

const prisma = new PrismaClient();
const log = (msg: string) => console.log(`  ✓ ${msg}`);
const isFresh = process.argv.includes("--fresh");

const EPOCH = new Date("2020-01-01T00:00:00.000Z");
const NOW = new Date();

type CategoryDef = {
	name: string;
	slug: string;
	children: { name: string; slug: string }[];
};
type MovementInput = {
	type:
		| "RECEIPT"
		| "SALE"
		| "ADJUSTMENT"
		| "TRANSFER_IN"
		| "TRANSFER_OUT"
		| "RETURN"
		| "DAMAGE";
	quantity: number;
	variantId: string;
	warehouseId: string;
	performedBy: string;
	notes: string | null;
	referenceType: string | null;
	referenceId: string | null;
	createdAt: Date;
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

const BRAND_DEFS = [
	{ name: "Apex Industries", slug: "apex-industries" },
	{ name: "NovaTech", slug: "novatech" },
	{ name: "PureForm", slug: "pureform" },
	{ name: "UrbanEdge", slug: "urbanedge" },
	{ name: "TerraGear", slug: "terragear" },
	{ name: "CloudNine", slug: "cloudnine" },
	{ name: "IronClad", slug: "ironclad" },
	{ name: "SwiftLine", slug: "swiftline" },
	{ name: "ZenCraft", slug: "zencraft" },
	{ name: "BoldWave", slug: "boldwave" },
	{ name: "KineticX", slug: "kineticx" },
	{ name: "LumaCore", slug: "lumacore" },
	{ name: "PixelRush", slug: "pixelrush" },
	{ name: "FluxBrand", slug: "fluxbrand" },
	{ name: "SkyBound", slug: "skybound" },
];

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

async function clearDatabase() {
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
	log("all collections cleared");
}

async function seedCategories() {
	const result: { id: string; slug: string }[] = [];
	for (let i = 0; i < CATEGORY_DEFS.length; i++) {
		const def = CATEGORY_DEFS[i];
		const parent = await prisma.category.upsert({
			where: { slug: def.slug },
			update: {},
			create: { name: def.name, slug: def.slug, isActive: true, sortOrder: i },
		});
		result.push(parent);
		for (let j = 0; j < def.children.length; j++) {
			const child = def.children[j];
			const childDoc = await prisma.category.upsert({
				where: { slug: child.slug },
				update: {},
				create: {
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
	log(
		`${result.length} categories (${CATEGORY_DEFS.filter((d) => d.children.length > 0).length} with sub-categories)`,
	);
	return result;
}

async function seedBrands() {
	const brands = await Promise.all(
		BRAND_DEFS.map((def) =>
			prisma.brand.upsert({
				where: { slug: def.slug },
				update: {},
				create: { name: def.name, slug: def.slug, isActive: true },
			}),
		),
	);
	log(`${brands.length} brands`);
	return brands;
}

async function seedWarehouses() {
	const warehouses = await Promise.all(
		WAREHOUSE_DEFS.map((def) =>
			prisma.warehouse.upsert({
				where: { code: def.code },
				update: {},
				create: {
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

async function seedSuppliers() {
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

async function seedProducts(
	categories: { id: string; slug: string }[],
	brands: { id: string }[],
) {
	const parentSlugs = new Set(
		CATEGORY_DEFS.filter((d) => d.children.length > 0).map((d) => d.slug),
	);
	const leafCategories = categories.filter((c) => !parentSlugs.has(c.slug));
	const allVariants: { id: string }[] = [];

	for (const category of leafCategories) {
		for (let i = 0; i < 6; i++) {
			const sku = faker.string.alphanumeric(8).toUpperCase();
			const name = faker.commerce.productName();
			const slugBase = name
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, "-")
				.replace(/^-|-$/g, "");
			const createdAt = faker.date.between({ from: EPOCH, to: NOW });

			const product = await prisma.product.upsert({
				where: { sku },
				update: {},
				create: {
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
					isActive: true,
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

				const variant = await prisma.productVariant.upsert({
					where: { sku: vSku },
					update: {},
					create: {
						sku: vSku,
						name: `${name} — ${optionVal}`,
						options: option,
						price: faker.number.float({
							min: 9.99,
							max: 1299.99,
							fractionDigits: 2,
						}),
						compareAtPrice: faker.datatype.boolean(0.3)
							? faker.number.float({ min: 1300, max: 1800, fractionDigits: 2 })
							: undefined,
						weight: faker.number.float({ min: 0.1, max: 8, fractionDigits: 2 }),
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

function buildMovementsForItem(
	variantId: string,
	warehouseId: string,
): MovementInput[] {
	const movements: MovementInput[] = [];

	movements.push({
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

	let cursor = new Date("2020-04-01T00:00:00.000Z");
	while (cursor < NOW) {
		const quarterEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 3, 0);
		const windowEnd = quarterEnd < NOW ? quarterEnd : NOW;

		movements.push({
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

	const adjTypes = ["ADJUSTMENT", "RETURN", "DAMAGE"] as const;
	const adjCount = faker.number.int({ min: 3, max: 8 });
	for (let i = 0; i < adjCount; i++) {
		const adjType = faker.helpers.arrayElement(adjTypes);
		movements.push({
			type: adjType,
			quantity:
				adjType === "RETURN"
					? faker.number.int({ min: 1, max: 20 })
					: -faker.number.int({ min: 1, max: 15 }),
			variantId,
			warehouseId,
			performedBy: "warehouse-manager",
			notes: faker.helpers.arrayElement([
				"Annual stock count adjustment",
				"Customer return — restocked",
				"Damaged in transit — written off",
				"Cycle count correction",
				"Supplier overshipment adjustment",
				"Returned — quality passed",
				"Write-off approved by ops",
				"Shrinkage — quarterly audit",
			]),
			referenceType: null,
			referenceId: null,
			createdAt: faker.date.between({ from: EPOCH, to: NOW }),
		});
	}

	return movements;
}

async function seedInventory(
	variants: { id: string }[],
	warehouses: { id: string }[],
) {
	const allMovements: MovementInput[] = [];

	for (const variant of variants) {
		for (const warehouse of warehouses) {
			const qty = faker.number.int({ min: 30, max: 400 });
			await prisma.inventoryItem.upsert({
				where: {
					variantId_warehouseId: {
						variantId: variant.id,
						warehouseId: warehouse.id,
					},
				},
				update: {},
				create: {
					variantId: variant.id,
					warehouseId: warehouse.id,
					quantityOnHand: qty,
					quantityReserved: faker.number.int({
						min: 0,
						max: Math.max(1, Math.floor(qty * 0.1)),
					}),
					reorderPoint: faker.number.int({ min: 10, max: 40 }),
					reorderQuantity: faker.number.int({ min: 50, max: 200 }),
				},
			});
			allMovements.push(...buildMovementsForItem(variant.id, warehouse.id));
		}
	}

	await prisma.stockMovement.createMany({ data: allMovements });
	log(`${variants.length * warehouses.length} inventory items`);
	log(`${allMovements.length} stock movements (2020 → present)`);
}

async function seedPurchaseOrders(
	suppliers: { id: string }[],
	warehouses: { id: string }[],
	variants: { id: string }[],
) {
	let totalOrders = 0;
	let totalItems = 0;

	for (let year = 2020; year <= 2026; year++) {
		const poCount = year === 2026 ? 5 : 10;

		for (let p = 0; p < poCount; p++) {
			const yearStart = new Date(`${year}-01-01T00:00:00.000Z`);
			const yearEnd =
				year === 2026 ? NOW : new Date(`${year}-12-31T23:59:59.000Z`);
			const orderDate = faker.date.between({ from: yearStart, to: yearEnd });

			const status =
				year <= 2024
					? faker.helpers.weightedArrayElement([
							{ weight: 7, value: "RECEIVED" as const },
							{ weight: 2, value: "PARTIALLY_RECEIVED" as const },
							{ weight: 1, value: "CANCELLED" as const },
						])
					: year === 2025
						? faker.helpers.arrayElement([
								"CONFIRMED",
								"RECEIVED",
								"PARTIALLY_RECEIVED",
							] as const)
						: faker.helpers.arrayElement([
								"DRAFT",
								"SENT",
								"CONFIRMED",
							] as const);

			const po = await prisma.purchaseOrder.create({
				data: {
					orderNumber: `PO-${year}-${String(p + 1).padStart(4, "0")}-${faker.string.alphanumeric(4).toUpperCase()}`,
					status,
					supplierId: faker.helpers.arrayElement(suppliers).id,
					warehouseId: faker.helpers.arrayElement(warehouses).id,
					expectedAt: faker.date.soon({ days: 45, refDate: orderDate }),
					notes: faker.datatype.boolean(0.3)
						? faker.helpers.arrayElement([
								"Priority order — peak season",
								"Restocking after stockout",
								"Bulk discount negotiated",
								"Expedited shipping requested",
								"Seasonal inventory top-up",
							])
						: null,
					createdAt: orderDate,
				},
			});

			const pickedVariants = faker.helpers.arrayElements(variants, {
				min: 3,
				max: 7,
			});
			for (const v of pickedVariants) {
				const ordered = faker.number.int({ min: 20, max: 300 });
				await prisma.purchaseOrderItem.create({
					data: {
						purchaseOrderId: po.id,
						variantId: v.id,
						quantityOrdered: ordered,
						quantityReceived:
							status === "RECEIVED"
								? ordered
								: status === "PARTIALLY_RECEIVED"
									? faker.number.int({ min: 1, max: ordered - 1 })
									: 0,
						unitCost: faker.number.float({
							min: 2.5,
							max: 650,
							fractionDigits: 2,
						}),
						createdAt: orderDate,
					},
				});
				totalItems++;
			}
			totalOrders++;
		}
	}

	log(
		`${totalOrders} purchase orders with ${totalItems} line items (2020 → present)`,
	);
}

async function main() {
	if (isFresh) await clearDatabase();

	console.log("\n── Categories ──────────────────────────────────");
	const categories = await seedCategories();

	console.log("\n── Brands · Warehouses · Suppliers ─────────────");
	const [brands, warehouses, suppliers] = await Promise.all([
		seedBrands(),
		seedWarehouses(),
		seedSuppliers(),
	]);

	console.log("\n── Products & Variants ─────────────────────────");
	const variants = await seedProducts(categories, brands);

	console.log("\n── Inventory & Stock Movements ─────────────────");
	await seedInventory(variants, warehouses);

	console.log("\n── Purchase Orders ─────────────────────────────");
	await seedPurchaseOrders(suppliers, warehouses, variants);

	console.log("\n── Done ─────────────────────────────────────────\n");
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(() => prisma.$disconnect());
