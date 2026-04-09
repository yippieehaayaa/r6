import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Warehouse } from "lucide-react";
import { useMemo } from "react";
import { DataTable } from "@/components/table/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface InventoryRow {
	id: string;
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

interface WarehouseOption {
	id: string;
	name: string;
}

interface Props {
	data: InventoryRow[];
	isLoading: boolean;
	onAdjust: (item: InventoryRow) => void;
	warehouses: WarehouseOption[];
	warehouseFilter: string;
	onWarehouseFilterChange: (value: string) => void;
	statusFilter: string;
	onStatusFilterChange: (value: string) => void;
	filterValue: string;
	onFilterChange: (value: string) => void;
}

export function InventoryTable({
	data,
	isLoading,
	onAdjust,
	warehouses,
	warehouseFilter,
	onWarehouseFilterChange,
	statusFilter,
	onStatusFilterChange,
	filterValue,
	onFilterChange,
}: Props) {
	const columns = useMemo<ColumnDef<InventoryRow>[]>(
		() => [
			{
				id: "product",
				header: "Variant",
				cell: ({ row }) => (
					<div>
						<p className="font-medium text-sm">{row.original.variantName}</p>
						<p className="font-mono text-xs text-muted-foreground">
							{row.original.sku}
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
				enableHiding: false,
				enableSorting: false,
				cell: ({ row }) => (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon-sm">
								<MoreHorizontal />
								<span className="sr-only">Open menu</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onSelect={() => onAdjust(row.original)}>
								Adjust Stock
							</DropdownMenuItem>
							<DropdownMenuItem>View History</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				),
			},
		],
		[onAdjust],
	);

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-wrap items-center gap-2">
				<Select value={warehouseFilter} onValueChange={onWarehouseFilterChange}>
					<SelectTrigger className="w-48">
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
				<Select value={statusFilter} onValueChange={onStatusFilterChange}>
					<SelectTrigger className="w-44">
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
			<DataTable
				columns={columns}
				data={data}
				isLoading={isLoading}
				filterPlaceholder="Search by name, SKU or warehouse…"
				globalFilterValue={filterValue}
				onGlobalFilterChange={onFilterChange}
				defaultPageSize={20}
			/>
		</div>
	);
}
