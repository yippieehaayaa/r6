import type {
	ColumnDef,
	OnChangeFn,
	PaginationState,
} from "@tanstack/react-table";
import { Warehouse } from "lucide-react";
import { memo, useMemo } from "react";
import { DataTable } from "@/components/table/data-table";
import { Badge } from "@/components/ui/badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { InventoryRow } from "./types";

export type { InventoryRow };

function getStatusBadge(status: InventoryRow["status"]) {
	switch (status) {
		case "IN_STOCK":
			return (
				<Badge className="bg-badge-in-stock/10 text-badge-in-stock border border-badge-in-stock/20 text-xs">
					In Stock
				</Badge>
			);
		case "LOW_STOCK":
			return (
				<Badge className="bg-badge-low-stock/10 text-badge-low-stock border border-badge-low-stock/20 text-xs">
					Low Stock
				</Badge>
			);
		case "OUT_OF_STOCK":
			return (
				<Badge className="bg-badge-out-of-stock/10 text-badge-out-of-stock border border-badge-out-of-stock/20 text-xs">
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
	onRowClick: (item: InventoryRow) => void;
	warehouses: WarehouseOption[];
	warehouseFilter: string;
	onWarehouseFilterChange: (value: string) => void;
	filterValue: string;
	onFilterChange: (value: string) => void;
	rowCount?: number;
	paginationState?: PaginationState;
	onPaginationChange?: OnChangeFn<PaginationState>;
}

export const InventoryTable = memo(function InventoryTable({
	data,
	isLoading,
	onRowClick,
	warehouses,
	warehouseFilter,
	onWarehouseFilterChange,
	filterValue,
	onFilterChange,
	rowCount,
	paginationState,
	onPaginationChange,
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
					<span className="font-medium tabular-nums">
						{row.original.quantityOnHand}
					</span>
				),
			},
			{
				id: "reserved",
				header: "Reserved",
				cell: ({ row }) => (
					<span className="text-muted-foreground tabular-nums">
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
							"font-medium tabular-nums",
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
		],
		[],
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
			</div>
			<DataTable
				columns={columns}
				data={data}
				isLoading={isLoading}
				filterPlaceholder="Search by name or SKU…"
				globalFilterValue={filterValue}
				onGlobalFilterChange={onFilterChange}
				rowCount={rowCount}
				paginationState={paginationState}
				onPaginationChange={onPaginationChange}
				onRowClick={onRowClick}
			/>
		</div>
	);
});
