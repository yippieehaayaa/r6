import { useNavigate } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { Grid3x3, List, MoreHorizontal, Package, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/table/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ProductSheet } from "./product-sheet";

type ProductStatus = "DRAFT" | "ACTIVE" | "DISCONTINUED" | "ARCHIVED";

interface ProductRow {
	id: string;
	sku: string;
	name: string;
	slug: string;
	description: string;
	tags: string[];
	status: ProductStatus;
	categoryId: string;
	categoryName: string;
	brandName: string;
	price: number;
	currency: string;
	stockOnHand: number;
	stockReserved: number;
	createdAt: string;
	updatedAt: string;
}

const MOCK_PRODUCTS: ProductRow[] = [
	{
		id: "prod-001",
		sku: "ELEC-001",
		name: "Wireless Bluetooth Headphones",
		slug: "wireless-bluetooth-headphones",
		description: "Premium over-ear headphones with active noise cancellation.",
		tags: ["bluetooth", "audio", "noise-cancelling"],
		status: "ACTIVE",
		categoryId: "cat-electronics",
		categoryName: "Electronics",
		brandName: "SoundWave",
		price: 149.99,
		currency: "USD",
		stockOnHand: 42,
		stockReserved: 5,
		createdAt: "2024-01-15T08:00:00Z",
		updatedAt: "2024-06-01T10:30:00Z",
	},
	{
		id: "prod-002",
		sku: "ELEC-002",
		name: "Smart Watch Series 5",
		slug: "smart-watch-series-5",
		description: "Feature-packed smartwatch with health monitoring and GPS.",
		tags: ["wearable", "fitness", "gps"],
		status: "ACTIVE",
		categoryId: "cat-electronics",
		categoryName: "Electronics",
		brandName: "TechPulse",
		price: 299.99,
		currency: "USD",
		stockOnHand: 18,
		stockReserved: 3,
		createdAt: "2024-02-10T09:00:00Z",
		updatedAt: "2024-06-05T14:00:00Z",
	},
	{
		id: "prod-003",
		sku: "ELEC-003",
		name: '4K Ultra HD Monitor 27"',
		slug: "4k-ultra-hd-monitor-27",
		description: "Professional 27-inch 4K display with HDR support.",
		tags: ["monitor", "4k", "professional"],
		status: "ACTIVE",
		categoryId: "cat-electronics",
		categoryName: "Electronics",
		brandName: "ViewPro",
		price: 499.99,
		currency: "USD",
		stockOnHand: 9,
		stockReserved: 2,
		createdAt: "2024-01-20T07:30:00Z",
		updatedAt: "2024-05-20T11:00:00Z",
	},
	{
		id: "prod-004",
		sku: "ELEC-004",
		name: "Mechanical Gaming Keyboard",
		slug: "mechanical-gaming-keyboard",
		description: "RGB mechanical keyboard with Cherry MX switches.",
		tags: ["gaming", "keyboard", "rgb"],
		status: "ACTIVE",
		categoryId: "cat-electronics",
		categoryName: "Electronics",
		brandName: "GameForce",
		price: 129.99,
		currency: "USD",
		stockOnHand: 3,
		stockReserved: 1,
		createdAt: "2024-03-05T10:00:00Z",
		updatedAt: "2024-06-10T09:00:00Z",
	},
	{
		id: "prod-005",
		sku: "CLTH-001",
		name: "Men's Classic Oxford Shirt",
		slug: "mens-classic-oxford-shirt",
		description: "Timeless Oxford button-down shirt in premium cotton.",
		tags: ["men", "shirt", "formal"],
		status: "ACTIVE",
		categoryId: "cat-clothing",
		categoryName: "Clothing",
		brandName: "ClothCo",
		price: 59.99,
		currency: "USD",
		stockOnHand: 75,
		stockReserved: 10,
		createdAt: "2024-01-08T08:00:00Z",
		updatedAt: "2024-05-15T12:00:00Z",
	},
	{
		id: "prod-006",
		sku: "CLTH-002",
		name: "Women's Running Leggings",
		slug: "womens-running-leggings",
		description:
			"High-waist performance leggings with moisture-wicking fabric.",
		tags: ["women", "sports", "running"],
		status: "ACTIVE",
		categoryId: "cat-clothing",
		categoryName: "Clothing",
		brandName: "ActiveWear",
		price: 49.99,
		currency: "USD",
		stockOnHand: 120,
		stockReserved: 15,
		createdAt: "2024-02-14T09:00:00Z",
		updatedAt: "2024-06-01T08:00:00Z",
	},
	{
		id: "prod-007",
		sku: "CLTH-003",
		name: "Unisex Hooded Sweatshirt",
		slug: "unisex-hooded-sweatshirt",
		description: "Cozy fleece hoodie available in a range of colors.",
		tags: ["unisex", "casual", "hoodie"],
		status: "ACTIVE",
		categoryId: "cat-clothing",
		categoryName: "Clothing",
		brandName: "ClothCo",
		price: 39.99,
		currency: "USD",
		stockOnHand: 0,
		stockReserved: 0,
		createdAt: "2024-03-01T10:00:00Z",
		updatedAt: "2024-05-28T16:00:00Z",
	},
	{
		id: "prod-008",
		sku: "ACCS-001",
		name: "Leather Bifold Wallet",
		slug: "leather-bifold-wallet",
		description: "Slim genuine leather wallet with RFID blocking.",
		tags: ["leather", "wallet", "rfid"],
		status: "ACTIVE",
		categoryId: "cat-accessories",
		categoryName: "Accessories",
		brandName: "LeatherCraft",
		price: 34.99,
		currency: "USD",
		stockOnHand: 55,
		stockReserved: 8,
		createdAt: "2024-01-25T11:00:00Z",
		updatedAt: "2024-05-10T13:00:00Z",
	},
	{
		id: "prod-009",
		sku: "HOME-001",
		name: "Bamboo Desk Organizer",
		slug: "bamboo-desk-organizer",
		description: "Eco-friendly bamboo organizer with multiple compartments.",
		tags: ["bamboo", "eco", "desk"],
		status: "DRAFT",
		categoryId: "cat-home",
		categoryName: "Home & Living",
		brandName: "EcoHome",
		price: 24.99,
		currency: "USD",
		stockOnHand: 30,
		stockReserved: 0,
		createdAt: "2024-05-10T09:00:00Z",
		updatedAt: "2024-05-10T09:00:00Z",
	},
	{
		id: "prod-010",
		sku: "HOME-002",
		name: "Scented Soy Candle Set",
		slug: "scented-soy-candle-set",
		description: "Set of 3 hand-poured soy candles with natural fragrances.",
		tags: ["candle", "soy", "fragrance"],
		status: "ACTIVE",
		categoryId: "cat-home",
		categoryName: "Home & Living",
		brandName: "AromiCo",
		price: 29.99,
		currency: "USD",
		stockOnHand: 2,
		stockReserved: 0,
		createdAt: "2024-02-20T10:00:00Z",
		updatedAt: "2024-06-08T10:00:00Z",
	},
	{
		id: "prod-011",
		sku: "SPRT-001",
		name: "Adjustable Dumbbell Set",
		slug: "adjustable-dumbbell-set",
		description: "Compact adjustable dumbbells ranging from 5 to 52.5 lbs.",
		tags: ["fitness", "weights", "home-gym"],
		status: "DRAFT",
		categoryId: "cat-sports",
		categoryName: "Sports",
		brandName: "IronFlex",
		price: 349.99,
		currency: "USD",
		stockOnHand: 15,
		stockReserved: 2,
		createdAt: "2024-04-01T08:00:00Z",
		updatedAt: "2024-04-01T08:00:00Z",
	},
	{
		id: "prod-012",
		sku: "SPRT-002",
		name: "Yoga Mat Premium",
		slug: "yoga-mat-premium",
		description: "Non-slip 6mm thick yoga mat with alignment lines.",
		tags: ["yoga", "fitness", "non-slip"],
		status: "ACTIVE",
		categoryId: "cat-sports",
		categoryName: "Sports",
		brandName: "ZenFit",
		price: 49.99,
		currency: "USD",
		stockOnHand: 1,
		stockReserved: 0,
		createdAt: "2024-01-30T09:00:00Z",
		updatedAt: "2024-05-30T14:00:00Z",
	},
	{
		id: "prod-013",
		sku: "ELEC-005",
		name: "Portable Power Bank 20000mAh",
		slug: "portable-power-bank-20000mah",
		description: "High-capacity power bank with USB-C fast charging.",
		tags: ["battery", "portable", "usb-c"],
		status: "DISCONTINUED",
		categoryId: "cat-electronics",
		categoryName: "Electronics",
		brandName: "PowerUp",
		price: 69.99,
		currency: "USD",
		stockOnHand: 0,
		stockReserved: 0,
		createdAt: "2023-08-15T08:00:00Z",
		updatedAt: "2024-03-01T10:00:00Z",
	},
	{
		id: "prod-014",
		sku: "CLTH-004",
		name: "Vintage Denim Jacket",
		slug: "vintage-denim-jacket",
		description: "Classic stonewash denim jacket with distressed finish.",
		tags: ["denim", "vintage", "jacket"],
		status: "ARCHIVED",
		categoryId: "cat-clothing",
		categoryName: "Clothing",
		brandName: "RetroWear",
		price: 89.99,
		currency: "USD",
		stockOnHand: 0,
		stockReserved: 0,
		createdAt: "2023-06-01T08:00:00Z",
		updatedAt: "2024-01-10T09:00:00Z",
	},
	{
		id: "prod-015",
		sku: "ELEC-006",
		name: "Noise-Cancelling Earbuds Pro",
		slug: "noise-cancelling-earbuds-pro",
		description: "True wireless earbuds with 30-hour battery and ANC.",
		tags: ["earbuds", "wireless", "anc"],
		status: "DRAFT",
		categoryId: "cat-electronics",
		categoryName: "Electronics",
		brandName: "SoundWave",
		price: 199.99,
		currency: "USD",
		stockOnHand: 0,
		stockReserved: 0,
		createdAt: "2024-06-01T08:00:00Z",
		updatedAt: "2024-06-01T08:00:00Z",
	},
];

const GRID_PAGE_SIZE = 8;

function getStatusBadgeClass(status: ProductStatus) {
	switch (status) {
		case "ACTIVE":
			return "bg-green-50 text-green-700 border border-green-200";
		case "DRAFT":
			return "bg-slate-100 text-slate-600 border border-slate-200";
		case "DISCONTINUED":
			return "bg-amber-50 text-amber-700 border border-amber-200";
		case "ARCHIVED":
			return "bg-red-50 text-red-700 border border-red-200";
	}
}

function getStockBadge(stock: number) {
	if (stock === 0)
		return (
			<Badge className="bg-red-50 text-red-700 border border-red-200 text-xs">
				Out of Stock
			</Badge>
		);
	if (stock <= 5)
		return (
			<Badge className="bg-amber-50 text-amber-700 border border-amber-200 text-xs">
				Low Stock
			</Badge>
		);
	return (
		<Badge className="bg-green-50 text-green-700 border border-green-200 text-xs">
			In Stock
		</Badge>
	);
}

export default function ProductsPage() {
	const navigate = useNavigate();
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("all");
	const [statusFilter, setStatusFilter] = useState("all");
	const [view, setView] = useState<"grid" | "list">("grid");
	const [gridPage, setGridPage] = useState(0);
	const [sheetOpen, setSheetOpen] = useState(false);

	// Debounce search
	useMemo(() => {
		const timer = setTimeout(() => setDebouncedSearch(search), 300);
		return () => clearTimeout(timer);
	}, [search]);

	const filtered = useMemo(() => {
		return MOCK_PRODUCTS.filter((p) => {
			const matchesSearch =
				!debouncedSearch ||
				p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
				p.sku.toLowerCase().includes(debouncedSearch.toLowerCase());
			const matchesCategory =
				categoryFilter === "all" || p.categoryId === categoryFilter;
			const matchesStatus = statusFilter === "all" || p.status === statusFilter;
			return matchesSearch && matchesCategory && matchesStatus;
		});
	}, [debouncedSearch, categoryFilter, statusFilter]);

	// Stats
	const totalProducts = MOCK_PRODUCTS.length;
	const activeProducts = MOCK_PRODUCTS.filter(
		(p) => p.status === "ACTIVE",
	).length;
	const lowStockProducts = MOCK_PRODUCTS.filter(
		(p) => p.stockOnHand > 0 && p.stockOnHand <= 5,
	).length;
	const outOfStockProducts = MOCK_PRODUCTS.filter(
		(p) => p.stockOnHand === 0,
	).length;

	// Grid pagination
	const totalGridPages = Math.ceil(filtered.length / GRID_PAGE_SIZE);
	const gridItems = filtered.slice(
		gridPage * GRID_PAGE_SIZE,
		(gridPage + 1) * GRID_PAGE_SIZE,
	);

	const columns: ColumnDef<ProductRow>[] = [
		{
			id: "name",
			header: "Product",
			cell: ({ row }) => (
				<div>
					<p className="font-medium text-sm">{row.original.name}</p>
					<span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
						{row.original.sku}
					</span>
				</div>
			),
		},
		{
			accessorKey: "categoryName",
			header: "Category",
		},
		{
			id: "price",
			header: "Price",
			cell: ({ row }) => (
				<span className="font-medium">${row.original.price.toFixed(2)}</span>
			),
		},
		{
			id: "stock",
			header: "Stock",
			cell: ({ row }) => (
				<div className="flex items-center gap-2">
					<span className="text-sm">{row.original.stockOnHand}</span>
					{getStockBadge(row.original.stockOnHand)}
				</div>
			),
		},
		{
			id: "status",
			header: "Status",
			cell: ({ row }) => (
				<Badge
					className={cn("text-xs", getStatusBadgeClass(row.original.status))}
				>
					{row.original.status}
				</Badge>
			),
		},
		{
			id: "actions",
			header: "",
			cell: ({ row }) => (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon" className="size-8">
							<MoreHorizontal className="size-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem
							onClick={() =>
								navigate({
									to: "/r6/inventory-and-catalog/products/$productId",
									params: { productId: row.original.id },
								})
							}
						>
							Edit
						</DropdownMenuItem>
						<DropdownMenuItem>Duplicate</DropdownMenuItem>
						<DropdownMenuItem className="text-destructive">
							Archive
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			),
		},
	];

	return (
		<div className="flex flex-1 flex-col gap-4 p-4 pt-0 animate-stagger-children">
			<ProductSheet open={sheetOpen} onOpenChange={setSheetOpen} />

			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-xl font-semibold">Products</h1>
					<p className="text-sm text-muted-foreground">
						Manage your product catalog.
					</p>
				</div>
				<Button onClick={() => setSheetOpen(true)}>
					<Plus className="size-4" />
					New Product
				</Button>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
				{[
					{ label: "Total Products", value: totalProducts },
					{ label: "Active", value: activeProducts },
					{ label: "Low Stock", value: lowStockProducts },
					{ label: "Out of Stock", value: outOfStockProducts },
				].map((stat) => (
					<div key={stat.label} className="rounded-xl border bg-card p-4">
						<p className="text-xs text-muted-foreground">{stat.label}</p>
						<p className="text-2xl font-semibold mt-1">{stat.value}</p>
					</div>
				))}
			</div>

			{/* Toolbar */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
				<Input
					placeholder="Search products..."
					value={search}
					onChange={(e) => {
						setSearch(e.target.value);
						setGridPage(0);
					}}
					className="sm:max-w-xs"
				/>
				<Select
					value={categoryFilter}
					onValueChange={(v) => {
						setCategoryFilter(v);
						setGridPage(0);
					}}
				>
					<SelectTrigger className="sm:w-44">
						<SelectValue placeholder="All Categories" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Categories</SelectItem>
						<SelectItem value="cat-electronics">Electronics</SelectItem>
						<SelectItem value="cat-clothing">Clothing</SelectItem>
						<SelectItem value="cat-accessories">Accessories</SelectItem>
						<SelectItem value="cat-home">Home & Living</SelectItem>
						<SelectItem value="cat-sports">Sports</SelectItem>
					</SelectContent>
				</Select>
				<Select
					value={statusFilter}
					onValueChange={(v) => {
						setStatusFilter(v);
						setGridPage(0);
					}}
				>
					<SelectTrigger className="sm:w-40">
						<SelectValue placeholder="All Statuses" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Statuses</SelectItem>
						<SelectItem value="ACTIVE">Active</SelectItem>
						<SelectItem value="DRAFT">Draft</SelectItem>
						<SelectItem value="DISCONTINUED">Discontinued</SelectItem>
						<SelectItem value="ARCHIVED">Archived</SelectItem>
					</SelectContent>
				</Select>
				<div className="flex items-center gap-1 ml-auto">
					<Button
						variant="outline"
						size="icon"
						className={cn(
							"size-9",
							view === "grid" && "bg-accent text-accent-foreground",
						)}
						onClick={() => setView("grid")}
					>
						<Grid3x3 className="size-4" />
					</Button>
					<Button
						variant="outline"
						size="icon"
						className={cn(
							"size-9",
							view === "list" && "bg-accent text-accent-foreground",
						)}
						onClick={() => setView("list")}
					>
						<List className="size-4" />
					</Button>
				</div>
			</div>

			{/* Grid View */}
			{view === "grid" && (
				<>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{gridItems.map((product) => (
							<div
								key={product.id}
								className="bg-card shadow-sm border border-border/50 rounded-xl overflow-hidden"
							>
								<div className="bg-muted/50 aspect-square flex items-center justify-center">
									<Package className="size-12 text-muted-foreground/30" />
								</div>
								<div className="p-3 flex flex-col gap-2">
									<div className="flex items-start justify-between gap-2">
										<p className="font-medium text-sm leading-tight">
											{product.name}
										</p>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="ghost"
													size="icon"
													className="size-7 shrink-0"
												>
													<MoreHorizontal className="size-3.5" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem
													onClick={() =>
														navigate({
															to: "/r6/inventory-and-catalog/products/$productId",
															params: { productId: product.id },
														})
													}
												>
													Edit
												</DropdownMenuItem>
												<DropdownMenuItem>Duplicate</DropdownMenuItem>
												<DropdownMenuItem className="text-destructive">
													Archive
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
									<span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded w-fit text-muted-foreground">
										{product.sku}
									</span>
									<div className="flex items-center justify-between">
										<span className="font-semibold text-sm">
											${product.price.toFixed(2)}
										</span>
										{getStockBadge(product.stockOnHand)}
									</div>
									<div className="flex items-center justify-between">
										<span className="text-xs text-muted-foreground">
											{product.categoryName}
										</span>
										<Badge
											className={cn(
												"text-xs",
												getStatusBadgeClass(product.status),
											)}
										>
											{product.status}
										</Badge>
									</div>
								</div>
							</div>
						))}
					</div>

					{/* Grid Pagination */}
					{totalGridPages > 1 && (
						<div className="flex items-center justify-center gap-4">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setGridPage((p) => Math.max(0, p - 1))}
								disabled={gridPage === 0}
							>
								Previous
							</Button>
							<span className="text-sm text-muted-foreground">
								Page {gridPage + 1} of {totalGridPages}
							</span>
							<Button
								variant="outline"
								size="sm"
								onClick={() =>
									setGridPage((p) => Math.min(totalGridPages - 1, p + 1))
								}
								disabled={gridPage >= totalGridPages - 1}
							>
								Next
							</Button>
						</div>
					)}
				</>
			)}

			{/* List View */}
			{view === "list" && (
				<div className="rounded-xl border bg-card">
					<DataTable
						columns={columns}
						data={filtered}
						filterPlaceholder="Search products..."
						defaultPageSize={10}
					/>
				</div>
			)}
		</div>
	);
}
