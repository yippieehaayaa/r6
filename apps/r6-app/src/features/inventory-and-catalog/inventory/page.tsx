import type { ColumnDef } from "@tanstack/react-table";
import { AlertTriangle, MoreHorizontal, Warehouse } from "lucide-react";
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
import { StockAdjustSheet } from "./stock-adjust-sheet";

export interface InventoryRow {
	id: string;
	productName: string;
	variantName: string;
	sku: string;
	warehouseId: string;
	warehouseName: string;
	quantityOnHand: number;
	quantityReserved: number;
	quantityAvailable: number;
	reorderPoint: number;
	status: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
	updatedAt: string;
}

function computeStatus(
	onHand: number,
	reorderPoint: number,
): InventoryRow["status"] {
	if (onHand === 0) return "OUT_OF_STOCK";
	if (onHand <= reorderPoint) return "LOW_STOCK";
	return "IN_STOCK";
}

function makeRow(
	id: string,
	productName: string,
	variantName: string,
	sku: string,
	warehouseId: string,
	warehouseName: string,
	quantityOnHand: number,
	quantityReserved: number,
	reorderPoint: number,
	updatedAt: string,
): InventoryRow {
	return {
		id,
		productName,
		variantName,
		sku,
		warehouseId,
		warehouseName,
		quantityOnHand,
		quantityReserved,
		quantityAvailable: quantityOnHand - quantityReserved,
		reorderPoint,
		status: computeStatus(quantityOnHand, reorderPoint),
		updatedAt,
	};
}

const MOCK_INVENTORY: InventoryRow[] = [
	makeRow(
		"inv-001",
		"Wireless Bluetooth Headphones",
		"Standard",
		"ELEC-001",
		"WH-001",
		"Main Warehouse",
		42,
		5,
		10,
		"2024-06-01",
	),
	makeRow(
		"inv-002",
		"Smart Watch Series 5",
		"Black",
		"ELEC-002-BK",
		"WH-001",
		"Main Warehouse",
		18,
		3,
		10,
		"2024-06-05",
	),
	makeRow(
		"inv-003",
		"Smart Watch Series 5",
		"Silver",
		"ELEC-002-SL",
		"WH-002",
		"East Distribution",
		0,
		0,
		10,
		"2024-05-20",
	),
	makeRow(
		"inv-004",
		'4K Ultra HD Monitor 27"',
		"Standard",
		"ELEC-003",
		"WH-001",
		"Main Warehouse",
		9,
		2,
		10,
		"2024-05-20",
	),
	makeRow(
		"inv-005",
		"Mechanical Gaming Keyboard",
		"RGB Blue Switch",
		"ELEC-004-BL",
		"WH-001",
		"Main Warehouse",
		3,
		1,
		5,
		"2024-06-10",
	),
	makeRow(
		"inv-006",
		"Mechanical Gaming Keyboard",
		"RGB Red Switch",
		"ELEC-004-RD",
		"WH-002",
		"East Distribution",
		0,
		0,
		5,
		"2024-06-10",
	),
	makeRow(
		"inv-007",
		"Men's Classic Oxford Shirt",
		"White L",
		"CLTH-001-WL",
		"WH-001",
		"Main Warehouse",
		25,
		4,
		10,
		"2024-05-15",
	),
	makeRow(
		"inv-008",
		"Men's Classic Oxford Shirt",
		"Blue M",
		"CLTH-001-BM",
		"WH-003",
		"West Storage",
		50,
		6,
		10,
		"2024-05-15",
	),
	makeRow(
		"inv-009",
		"Women's Running Leggings",
		"Black S",
		"CLTH-002-BS",
		"WH-001",
		"Main Warehouse",
		60,
		8,
		20,
		"2024-06-01",
	),
	makeRow(
		"inv-010",
		"Women's Running Leggings",
		"Navy M",
		"CLTH-002-NM",
		"WH-002",
		"East Distribution",
		60,
		7,
		20,
		"2024-06-01",
	),
	makeRow(
		"inv-011",
		"Unisex Hooded Sweatshirt",
		"Grey L",
		"CLTH-003-GL",
		"WH-001",
		"Main Warehouse",
		0,
		0,
		15,
		"2024-05-28",
	),
	makeRow(
		"inv-012",
		"Leather Bifold Wallet",
		"Brown",
		"ACCS-001-BR",
		"WH-001",
		"Main Warehouse",
		30,
		5,
		10,
		"2024-05-10",
	),
	makeRow(
		"inv-013",
		"Leather Bifold Wallet",
		"Black",
		"ACCS-001-BK",
		"WH-003",
		"West Storage",
		25,
		3,
		10,
		"2024-05-10",
	),
	makeRow(
		"inv-014",
		"Scented Soy Candle Set",
		"Lavender",
		"HOME-002-LV",
		"WH-001",
		"Main Warehouse",
		2,
		0,
		5,
		"2024-06-08",
	),
	makeRow(
		"inv-015",
		"Adjustable Dumbbell Set",
		"Standard",
		"SPRT-001",
		"WH-001",
		"Main Warehouse",
		15,
		2,
		8,
		"2024-04-01",
	),
	makeRow(
		"inv-016",
		"Yoga Mat Premium",
		"Purple",
		"SPRT-002-PU",
		"WH-001",
		"Main Warehouse",
		1,
		0,
		5,
		"2024-05-30",
	),
	makeRow(
		"inv-017",
		"Noise-Cancelling Earbuds Pro",
		"White",
		"ELEC-006-WH",
		"WH-002",
		"East Distribution",
		0,
		0,
		10,
		"2024-06-01",
	),
	makeRow(
		"inv-018",
		"Bamboo Desk Organizer",
		"Natural",
		"HOME-001-NT",
		"WH-003",
		"West Storage",
		30,
		0,
		10,
		"2024-05-10",
	),
];

function getStatusBadge(status: InventoryRow["status"]) {
	switch (status) {
		case "IN_STOCK":
			return (
				<Badge className="bg-green-50 text-green-700 border border-green-200 text-xs">
					In Stock
				</Badge>
			);
		case "LOW_STOCK":
			return (
				<Badge className="bg-amber-50 text-amber-700 border border-amber-200 text-xs">
					Low Stock
				</Badge>
			);
		case "OUT_OF_STOCK":
			return (
				<Badge className="bg-red-50 text-red-700 border border-red-200 text-xs">
					Out of Stock
				</Badge>
			);
	}
}

export default function InventoryPage() {
	const [search, setSearch] = useState("");
	const [warehouseFilter, setWarehouseFilter] = useState("all");
	const [statusFilter, setStatusFilter] = useState("all");
	const [adjustSheetOpen, setAdjustSheetOpen] = useState(false);
	const [selectedItem, setSelectedItem] = useState<InventoryRow | null>(null);
	const [inventoryData, setInventoryData] =
		useState<InventoryRow[]>(MOCK_INVENTORY);

	const lowStockCount = inventoryData.filter(
		(i) => i.status === "LOW_STOCK",
	).length;
	const outOfStockCount = inventoryData.filter(
		(i) => i.status === "OUT_OF_STOCK",
	).length;
	const inStockCount = inventoryData.filter(
		(i) => i.status === "IN_STOCK",
	).length;

	const filtered = useMemo(() => {
		return inventoryData.filter((item) => {
			const matchesSearch =
				!search ||
				item.productName.toLowerCase().includes(search.toLowerCase()) ||
				item.sku.toLowerCase().includes(search.toLowerCase()) ||
				item.variantName.toLowerCase().includes(search.toLowerCase());
			const matchesWarehouse =
				warehouseFilter === "all" || item.warehouseId === warehouseFilter;
			const matchesStatus =
				statusFilter === "all" || item.status === statusFilter;
			return matchesSearch && matchesWarehouse && matchesStatus;
		});
	}, [inventoryData, search, warehouseFilter, statusFilter]);

	function handleAdjust(id: string, newQty: number) {
		setInventoryData((prev) =>
			prev.map((item) => {
				if (item.id !== id) return item;
				const onHand = newQty;
				const available = onHand - item.quantityReserved;
				return {
					...item,
					quantityOnHand: onHand,
					quantityAvailable: available,
					status: computeStatus(onHand, item.reorderPoint),
					updatedAt: new Date().toISOString().split("T")[0],
				};
			}),
		);
	}

	const columns: ColumnDef<InventoryRow>[] = [
		{
			id: "product",
			header: "Product",
			cell: ({ row }) => (
				<div>
					<p className="font-medium text-sm">{row.original.productName}</p>
					<p className="text-xs text-muted-foreground">
						{row.original.variantName}
					</p>
				</div>
			),
		},
		{
			accessorKey: "sku",
			header: "SKU",
			cell: ({ row }) => (
				<span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
					{row.original.sku}
				</span>
			),
		},
		{
			id: "location",
			header: "Location",
			cell: ({ row }) => (
				<div className="flex items-center gap-1.5 text-sm">
					<Warehouse className="size-3.5 text-muted-foreground" />
					{row.original.warehouseName}
				</div>
			),
		},
		{
			id: "onHand",
			header: "On Hand",
			cell: ({ row }) => (
				<span className="font-medium">{row.original.quantityOnHand}</span>
			),
		},
		{
			id: "reserved",
			header: "Reserved",
			cell: ({ row }) => (
				<span className="text-muted-foreground">
					{row.original.quantityReserved}
				</span>
			),
		},
		{
			id: "available",
			header: "Available",
			cell: ({ row }) => (
				<span
					className={cn(
						"font-medium",
						row.original.quantityAvailable === 0 && "text-red-600",
						row.original.quantityAvailable > 0 &&
							row.original.quantityAvailable <= 5 &&
							"text-amber-600",
					)}
				>
					{row.original.quantityAvailable}
				</span>
			),
		},
		{
			id: "status",
			header: "Status",
			cell: ({ row }) => getStatusBadge(row.original.status),
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
							onClick={() => {
								setSelectedItem(row.original);
								setAdjustSheetOpen(true);
							}}
						>
							Adjust Stock
						</DropdownMenuItem>
						<DropdownMenuItem>View History</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			),
		},
	];

	return (
		<div className="flex flex-1 flex-col gap-4 p-4 pt-0 animate-stagger-children">
			<StockAdjustSheet
				open={adjustSheetOpen}
				onOpenChange={setAdjustSheetOpen}
				item={selectedItem}
				onAdjust={handleAdjust}
			/>

			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-xl font-semibold">Inventory</h1>
					<p className="text-sm text-muted-foreground">
						Track stock levels across all locations.
					</p>
				</div>
			</div>

			{/* Low Stock Alert */}
			{lowStockCount > 0 && (
				<div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 flex items-center gap-3">
					<AlertTriangle className="size-5 shrink-0" />
					<span className="text-sm font-medium">
						{lowStockCount} product{lowStockCount > 1 ? "s are" : " is"} low on
						stock.
					</span>
					<Button
						variant="link"
						className="text-amber-800 underline p-0 h-auto ml-auto"
						onClick={() => setStatusFilter("LOW_STOCK")}
					>
						Review
					</Button>
				</div>
			)}

			{/* Stats */}
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
				{[
					{ label: "Total Items", value: inventoryData.length },
					{ label: "In Stock", value: inStockCount },
					{ label: "Low Stock", value: lowStockCount },
					{ label: "Out of Stock", value: outOfStockCount },
				].map((stat) => (
					<div key={stat.label} className="rounded-xl border bg-card p-4">
						<p className="text-xs text-muted-foreground">{stat.label}</p>
						<p className="text-2xl font-semibold mt-1">{stat.value}</p>
					</div>
				))}
			</div>

			{/* Filters */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
				<Input
					placeholder="Search products, SKUs..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="sm:max-w-xs"
				/>
				<Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
					<SelectTrigger className="sm:w-48">
						<SelectValue placeholder="All Warehouses" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Warehouses</SelectItem>
						<SelectItem value="WH-001">Main Warehouse</SelectItem>
						<SelectItem value="WH-002">East Distribution</SelectItem>
						<SelectItem value="WH-003">West Storage</SelectItem>
					</SelectContent>
				</Select>
				<Select value={statusFilter} onValueChange={setStatusFilter}>
					<SelectTrigger className="sm:w-44">
						<SelectValue placeholder="All Statuses" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Statuses</SelectItem>
						<SelectItem value="IN_STOCK">In Stock</SelectItem>
						<SelectItem value="LOW_STOCK">Low Stock</SelectItem>
						<SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Table */}
			<div className="rounded-xl border bg-card">
				<DataTable
					columns={columns}
					data={filtered}
					filterPlaceholder="Search inventory..."
					defaultPageSize={20}
				/>
			</div>
		</div>
	);
}
