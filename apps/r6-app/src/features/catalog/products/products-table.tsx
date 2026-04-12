import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { DataTable } from "@/components/table/data-table";
import { Badge } from "@/components/ui/badge";
import type { Product, ProductStatus } from "../types";

const statusLabel: Record<ProductStatus, string> = {
	DRAFT: "Draft",
	ACTIVE: "Active",
	DISCONTINUED: "Discontinued",
	ARCHIVED: "Archived",
};

const statusVariant: Record<
	ProductStatus,
	"default" | "secondary" | "outline" | "destructive"
> = {
	DRAFT: "outline",
	ACTIVE: "default",
	DISCONTINUED: "secondary",
	ARCHIVED: "destructive",
};

interface Props {
	data: Product[];
	isLoading?: boolean;
	filterValue?: string;
	onFilterChange?: (value: string) => void;
}

export function ProductsTable({
	data,
	isLoading,
	filterValue,
	onFilterChange,
}: Props) {
	const columns = useMemo<ColumnDef<Product>[]>(
		() => [
			{
				accessorKey: "name",
				header: "Product",
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
				accessorKey: "status",
				header: "Status",
				cell: ({ row }) => (
					<Badge variant={statusVariant[row.original.status]}>
						{statusLabel[row.original.status]}
					</Badge>
				),
			},
			{
				accessorKey: "categoryName",
				header: "Category",
				cell: ({ row }) => (
					<span className="text-sm text-muted-foreground">
						{row.original.categoryName ?? "—"}
					</span>
				),
			},
			{
				accessorKey: "brandName",
				header: "Brand",
				cell: ({ row }) => (
					<span className="text-sm text-muted-foreground">
						{row.original.brandName ?? "—"}
					</span>
				),
			},
			{
				accessorKey: "variantCount",
				header: "Variants",
				cell: ({ row }) => (
					<span className="font-medium tabular-nums">
						{row.original.variantCount}
					</span>
				),
			},
			{
				accessorKey: "tags",
				header: "Tags",
				cell: ({ row }) =>
					row.original.tags.length > 0 ? (
						<div className="flex flex-wrap gap-1">
							{row.original.tags.map((tag) => (
								<Badge key={tag} variant="secondary" className="text-xs">
									{tag}
								</Badge>
							))}
						</div>
					) : (
						<span className="text-sm text-muted-foreground">—</span>
					),
			},
			{
				accessorKey: "createdAt",
				header: "Created",
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
			filterPlaceholder="Search products..."
		/>
	);
}
