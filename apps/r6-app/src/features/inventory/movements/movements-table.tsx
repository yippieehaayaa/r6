import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { DataTable } from "@/components/table/data-table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { MovementType, StockMovement } from "../types";

const movementLabel: Record<MovementType, string> = {
	RECEIPT: "Receipt",
	SALE: "Sale",
	RETURN: "Return",
	ADJUSTMENT: "Adjustment",
	TRANSFER_IN: "Transfer In",
	TRANSFER_OUT: "Transfer Out",
	DAMAGE: "Damage",
	RESERVATION: "Reserved",
	RESERVATION_RELEASE: "Released",
};

const movementVariant: Record<
	MovementType,
	"default" | "secondary" | "destructive" | "outline"
> = {
	RECEIPT: "default",
	SALE: "secondary",
	RETURN: "outline",
	ADJUSTMENT: "outline",
	TRANSFER_IN: "default",
	TRANSFER_OUT: "secondary",
	DAMAGE: "destructive",
	RESERVATION: "outline",
	RESERVATION_RELEASE: "outline",
};

interface Props {
	data: StockMovement[];
	isLoading?: boolean;
	filterValue?: string;
	onFilterChange?: (value: string) => void;
}

export function MovementsTable({
	data,
	isLoading,
	filterValue,
	onFilterChange,
}: Props) {
	const columns = useMemo<ColumnDef<StockMovement>[]>(
		() => [
			{
				accessorKey: "createdAt",
				header: "Date",
				cell: ({ row }) => (
					<span className="text-sm tabular-nums text-muted-foreground">
						{new Date(row.original.createdAt).toLocaleString(undefined, {
							month: "short",
							day: "numeric",
							hour: "2-digit",
							minute: "2-digit",
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
				accessorKey: "movementType",
				header: "Type",
				cell: ({ row }) => (
					<Badge variant={movementVariant[row.original.movementType]}>
						{movementLabel[row.original.movementType]}
					</Badge>
				),
			},
			{
				accessorKey: "quantity",
				header: "Qty",
				cell: ({ row }) => {
					const qty = row.original.quantity;
					return (
						<span
							className={cn(
								"font-medium tabular-nums",
								qty > 0 ? "text-badge-in-stock" : "text-badge-out-of-stock",
							)}
						>
							{qty > 0 ? "+" : ""}
							{qty.toLocaleString()}
						</span>
					);
				},
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
				accessorKey: "referenceId",
				header: "Reference",
				cell: ({ row }) => (
					<span className="text-sm text-muted-foreground font-mono">
						{row.original.referenceId ?? "—"}
					</span>
				),
			},
			{
				accessorKey: "performedByName",
				header: "By",
				cell: ({ row }) => (
					<span className="text-sm text-muted-foreground">
						{row.original.performedByName}
					</span>
				),
			},
		],
		[],
	);

	return (
		<DataTable
			columns={columns}
			data={data}
			isLoading={isLoading}
			globalFilterValue={filterValue}
			onGlobalFilterChange={onFilterChange}
			filterPlaceholder="Search movements..."
		/>
	);
}
