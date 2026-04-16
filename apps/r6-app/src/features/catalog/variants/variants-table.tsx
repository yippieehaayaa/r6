import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { DataTable } from "@/components/table/data-table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ProductVariant, TrackingType } from "../types";

const trackingLabel: Record<TrackingType, string> = {
	NONE: "Standard",
	SERIAL: "Serial",
	BATCH: "Batch",
};

const trackingVariant: Record<
	TrackingType,
	"default" | "secondary" | "outline"
> = {
	NONE: "outline",
	SERIAL: "default",
	BATCH: "secondary",
};

interface Props {
	data: ProductVariant[];
	isLoading?: boolean;
	filterValue?: string;
	onFilterChange?: (value: string) => void;
}

export function VariantsTable({
	data,
	isLoading,
	filterValue,
	onFilterChange,
}: Props) {
	const columns = useMemo<ColumnDef<ProductVariant>[]>(
		() => [
			{
				accessorKey: "name",
				header: "Variant",
				cell: ({ row }) => (
					<div>
						<p className="font-medium text-sm">{row.original.name}</p>
						<p className="text-xs text-muted-foreground font-mono">
							{row.original.sku}
						</p>
					</div>
				),
			},
			{
				accessorKey: "productName",
				header: "Product",
				cell: ({ row }) => (
					<div>
						<p className="text-sm">{row.original.productName}</p>
						<p className="text-xs text-muted-foreground font-mono">
							{row.original.productSku}
						</p>
					</div>
				),
			},
			{
				accessorKey: "barcode",
				header: "Barcode",
				cell: ({ row }) => (
					<span className="text-sm text-muted-foreground font-mono">
						{row.original.barcode ?? "—"}
					</span>
				),
			},
			{
				accessorKey: "trackingType",
				header: "Tracking",
				cell: ({ row }) => (
					<Badge variant={trackingVariant[row.original.trackingType]}>
						{trackingLabel[row.original.trackingType]}
					</Badge>
				),
			},
			{
				accessorKey: "baseUom",
				header: "UOM",
				cell: ({ row }) => (
					<span className="text-sm text-muted-foreground uppercase">
						{row.original.baseUom}
					</span>
				),
			},
			{
				accessorKey: "totalOnHand",
				header: "On Hand",
				cell: ({ row }) => (
					<span className="font-medium tabular-nums">
						{row.original.totalOnHand.toLocaleString()}
					</span>
				),
			},
			{
				accessorKey: "totalAvailable",
				header: "Available",
				cell: ({ row }) => {
					const qty = row.original.totalAvailable;
					return (
						<span
							className={cn(
								"font-medium tabular-nums",
								qty === 0 && "text-badge-out-of-stock",
								qty > 0 && qty <= 10 && "text-badge-low-stock",
							)}
						>
							{qty.toLocaleString()}
						</span>
					);
				},
			},
			{
				accessorKey: "isActive",
				header: "Active",
				cell: ({ row }) => (
					<Badge variant={row.original.isActive ? "default" : "secondary"}>
						{row.original.isActive ? "Yes" : "No"}
					</Badge>
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
			filterPlaceholder="Search variants by name, SKU, barcode..."
		/>
	);
}
