import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { DataTable } from "@/components/table/data-table";
import { Badge } from "@/components/ui/badge";
import type { Brand } from "../types";

interface Props {
	data: Brand[];
	isLoading?: boolean;
	filterValue?: string;
	onFilterChange?: (value: string) => void;
}

export function BrandsTable({
	data,
	isLoading,
	filterValue,
	onFilterChange,
}: Props) {
	const columns = useMemo<ColumnDef<Brand>[]>(
		() => [
			{
				accessorKey: "name",
				header: "Brand",
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
				accessorKey: "description",
				header: "Description",
				cell: ({ row }) => (
					<p className="text-sm text-muted-foreground max-w-md truncate">
						{row.original.description ?? "—"}
					</p>
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
			filterPlaceholder="Search brands..."
		/>
	);
}
