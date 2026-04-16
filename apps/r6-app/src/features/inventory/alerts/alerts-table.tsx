import type { ColumnDef } from "@tanstack/react-table";
import { Check, Eye, MoreHorizontal } from "lucide-react";
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
import type { AlertStatus, AlertType, StockAlert } from "../types";

const alertLabel: Record<AlertType, string> = {
	LOW_STOCK: "Low Stock",
	OUT_OF_STOCK: "Out of Stock",
	OVERSTOCK: "Overstock",
	LOT_EXPIRING: "Lot Expiring",
	LOT_EXPIRED: "Lot Expired",
	COUNT_VARIANCE: "Count Variance",
};

const alertVariant: Record<
	AlertType,
	"default" | "destructive" | "outline" | "secondary"
> = {
	LOW_STOCK: "outline",
	OUT_OF_STOCK: "destructive",
	OVERSTOCK: "secondary",
	LOT_EXPIRING: "outline",
	LOT_EXPIRED: "destructive",
	COUNT_VARIANCE: "secondary",
};

const statusBadgeVariant: Record<
	AlertStatus,
	"default" | "secondary" | "outline" | "destructive"
> = {
	OPEN: "destructive",
	ACKNOWLEDGED: "outline",
	RESOLVED: "secondary",
};

interface Props {
	data: StockAlert[];
	isLoading?: boolean;
	filterValue?: string;
	onFilterChange?: (value: string) => void;
	onAcknowledge?: (alert: StockAlert) => void;
	onResolve?: (alert: StockAlert) => void;
}

export function AlertsTable({
	data,
	isLoading,
	filterValue,
	onFilterChange,
	onAcknowledge,
	onResolve,
}: Props) {
	const columns = useMemo<ColumnDef<StockAlert>[]>(
		() => [
			{
				accessorKey: "createdAt",
				header: "Date",
				cell: ({ row }) => (
					<span className="text-sm tabular-nums text-muted-foreground">
						{new Date(row.original.createdAt).toLocaleDateString(undefined, {
							month: "short",
							day: "numeric",
							year: "numeric",
						})}
					</span>
				),
			},
			{
				accessorKey: "variant.name",
				header: "Variant",
				cell: ({ row }) => (
					<div>
						<p className="font-medium text-sm">{row.original.variant.name}</p>
						<p className="text-xs text-muted-foreground font-mono">
							{row.original.variant.sku}
						</p>
					</div>
				),
			},
			{
				accessorKey: "alertType",
				header: "Type",
				cell: ({ row }) => (
					<Badge variant={alertVariant[row.original.alertType]}>
						{alertLabel[row.original.alertType]}
					</Badge>
				),
			},
			{
				accessorKey: "alertStatus",
				header: "Status",
				cell: ({ row }) => (
					<Badge variant={statusBadgeVariant[row.original.alertStatus]}>
						{row.original.alertStatus}
					</Badge>
				),
			},
			{
				accessorKey: "currentQuantity",
				header: "Current Qty",
				cell: ({ row }) => (
					<span className="font-medium tabular-nums">
						{row.original.currentQuantity.toLocaleString()}
					</span>
				),
			},
			{
				accessorKey: "warehouse.name",
				header: "Warehouse",
				cell: ({ row }) => (
					<span className="text-sm text-muted-foreground">
						{row.original.warehouse.name}
					</span>
				),
			},
			{
				id: "actions",
				header: "",
				enableHiding: false,
				enableSorting: false,
				cell: ({ row }) => {
					const alert = row.original;
					if (alert.alertStatus === "RESOLVED") return null;
					return (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="icon-sm">
									<MoreHorizontal />
									<span className="sr-only">Actions</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								{alert.alertStatus === "OPEN" && onAcknowledge && (
									<DropdownMenuItem onSelect={() => onAcknowledge(alert)}>
										<Eye />
										Acknowledge
									</DropdownMenuItem>
								)}
								{onResolve && (
									<DropdownMenuItem onSelect={() => onResolve(alert)}>
										<Check />
										Resolve
									</DropdownMenuItem>
								)}
							</DropdownMenuContent>
						</DropdownMenu>
					);
				},
			},
		],
		[onAcknowledge, onResolve],
	);

	return (
		<DataTable
			columns={columns}
			data={data}
			isLoading={isLoading}
			globalFilterValue={filterValue}
			onGlobalFilterChange={onFilterChange}
			filterPlaceholder="Search alerts..."
		/>
	);
}
