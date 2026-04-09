import type { InventoryItem } from "@r6/schemas";
import type { ColumnDef } from "@tanstack/react-table";
import { AlertTriangle, MoreHorizontal, Warehouse } from "lucide-react";
import { useMemo, useState } from "react";
import {
	useGetLowStockItemsQuery,
	useListWarehousesQuery,
} from "@/api/inventory-and-catalog";
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
	variantId: string;
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

function mapInventoryItem(item: InventoryItem): InventoryRow {
	return {
		id: item.id,
		productName: "—",
		variantName: item.variantId,
		sku: item.variantId,
		variantId: item.variantId,
		warehouseId: item.warehouseId,
		warehouseName: item.warehouseId,
		quantityOnHand: item.quantityOnHand,
		quantityReserved: item.quantityReserved,
		quantityAvailable: item.quantityOnHand - item.quantityReserved,
		reorderPoint: item.reorderPoint,
		status: computeStatus(item.quantityOnHand, item.reorderPoint),
		updatedAt: item.updatedAt,
	};
}

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
	const [localOverrides, setLocalOverrides] = useState<Record<string, number>>(
		{},
	);

	const { data: warehousesData } = useListWarehousesQuery({ limit: 100 });
	const warehouses = warehousesData?.data ?? [];

	const { data: lowStockData, isLoading } = useGetLowStockItemsQuery(
		warehouseFilter !== "all" ? warehouseFilter : undefined,
	);

	const inventoryData: InventoryRow[] = useMemo(() => {
		const items = (lowStockData ?? []).map(mapInventoryItem);
		return items.map((row) => {
			const override = localOverrides[row.id];
			if (override !== undefined) {
				return {
					...row,
					quantityOnHand: override,
					quantityAvailable: override - row.quantityReserved,
					status: computeStatus(override, row.reorderPoint),
				};
			}
			return row;
		});
	}, [lowStockData, localOverrides]);

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
				item.variantId.toLowerCase().includes(search.toLowerCase()) ||
				item.warehouseId.toLowerCase().includes(search.toLowerCase());
			const matchesStatus =
				statusFilter === "all" || item.status === statusFilter;
			return matchesSearch && matchesStatus;
		});
	}, [inventoryData, search, statusFilter]);

	function handleAdjust(id: string, newQty: number) {
		setLocalOverrides((prev) => ({ ...prev, [id]: newQty }));
	}

	const columns: ColumnDef<InventoryRow>[] = [
		{
			id: "product",
			header: "Variant",
			cell: ({ row }) => (
				<div>
					<p className="font-mono text-xs text-muted-foreground">
						{row.original.variantId}
					</p>
				</div>
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
					placeholder="Search by variant ID or warehouse..."
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
						{warehouses.map((w) => (
							<SelectItem key={w.id} value={w.id}>
								{w.name}
							</SelectItem>
						))}
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
					isLoading={isLoading}
					filterPlaceholder="Search inventory..."
					defaultPageSize={20}
				/>
			</div>
		</div>
	);
}
