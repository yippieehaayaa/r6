import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { DataTable } from "@/components/table/data-table";
import { Badge } from "@/components/ui/badge";
import type { Category } from "../types";

interface Props {
	data: Category[];
	isLoading?: boolean;
	filterValue?: string;
	onFilterChange?: (value: string) => void;
}

export function CategoriesTable({
	data,
	isLoading,
	filterValue,
	onFilterChange,
}: Props) {
	const columns = useMemo<ColumnDef<Category>[]>(
		() => [
			{
				accessorKey: "name",
				header: "Category",
				cell: ({ row }) => (
					<div>
						<p className="font-medium text-sm">{row.original.name}</p>
						<p className="text-xs text-muted-foreground font-mono">
							{row.original.slug}
						</p>
					</div>
				),
			},
			{
				accessorKey: "parentName",
				header: "Parent",
				cell: ({ row }) => (
					<span className="text-sm text-muted-foreground">
						{row.original.parentName ?? "—"}
					</span>
				),
			},
			{
				accessorKey: "path",
				header: "Path",
				cell: ({ row }) => (
					<span className="text-xs text-muted-foreground font-mono">
						{row.original.path}
					</span>
				),
			},
			{
				accessorKey: "productCount",
				header: "Products",
				cell: ({ row }) => (
					<span className="font-medium tabular-nums">
						{row.original.productCount}
					</span>
				),
			},
			{
				accessorKey: "sortOrder",
				header: "Order",
				cell: ({ row }) => (
					<span className="text-sm tabular-nums text-muted-foreground">
						{row.original.sortOrder}
					</span>
				),
			},
			{
				accessorKey: "isActive",
				header: "Status",
				cell: ({ row }) => (
					<Badge variant={row.original.isActive ? "default" : "secondary"}>
						{row.original.isActive ? "Active" : "Inactive"}
					</Badge>
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
			filterPlaceholder="Search categories..."
		/>
	);
}
