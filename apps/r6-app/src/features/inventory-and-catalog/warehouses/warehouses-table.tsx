import type { Warehouse } from "@r6/schemas";
import type {
	ColumnDef,
	OnChangeFn,
	PaginationState,
} from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
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

export interface WarehouseRow {
	id: string;
	name: string;
	location: string;
	capacity: number;
	status: string;
	createdAt: string;
}

export function mapWarehouse(w: Warehouse): WarehouseRow {
	return {
		id: w.id,
		name: w.name,
		location: w.address?.city ?? w.address?.country ?? "—",
		capacity: 0,
		status: w.isActive ? "Active" : "Inactive",
		createdAt: w.createdAt,
	};
}

interface Props {
	data: WarehouseRow[];
	isLoading: boolean;
	onDelete: (id: string) => void;
	canDelete: boolean;
	rowCount?: number;
	paginationState?: PaginationState;
	onPaginationChange?: OnChangeFn<PaginationState>;
	filterValue?: string;
	onFilterChange?: (value: string) => void;
}

export function WarehousesTable({
	data,
	isLoading,
	onDelete,
	canDelete,
	rowCount,
	paginationState,
	onPaginationChange,
	filterValue,
	onFilterChange,
}: Props) {
	const columns = useMemo<ColumnDef<WarehouseRow>[]>(
		() => [
			{
				accessorKey: "name",
				header: "Name",
				cell: ({ row }) => (
					<span className="font-medium">{row.original.name}</span>
				),
			},
			{
				accessorKey: "location",
				header: "Location",
				cell: ({ row }) => (
					<span className="text-muted-foreground">{row.original.location}</span>
				),
			},
			{
				accessorKey: "capacity",
				header: "Capacity",
				cell: ({ row }) => (
					<span className="text-muted-foreground">{row.original.capacity}</span>
				),
			},
			{
				accessorKey: "status",
				header: "Status",
				cell: ({ row }) => (
					<Badge
						variant={row.original.status === "Active" ? "default" : "secondary"}
					>
						{row.original.status}
					</Badge>
				),
			},
			{
				accessorKey: "createdAt",
				header: "Created At",
				cell: ({ row }) => (
					<span className="text-muted-foreground text-xs">
						{new Date(row.original.createdAt).toLocaleDateString()}
					</span>
				),
			},
			...(canDelete
				? [
						{
							id: "actions",
							header: "",
							enableHiding: false,
							enableSorting: false,
							cell: ({ row }: { row: { original: WarehouseRow } }) => (
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="icon-sm">
											<MoreHorizontal />
											<span className="sr-only">Open menu</span>
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem
											variant="destructive"
											onSelect={() => onDelete(row.original.id)}
										>
											Delete
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							),
						} satisfies ColumnDef<WarehouseRow>,
					]
				: []),
		],
		[canDelete, onDelete],
	);

	return (
		<DataTable
			columns={columns}
			data={data}
			isLoading={isLoading}
			rowCount={rowCount}
			paginationState={paginationState}
			onPaginationChange={onPaginationChange}
			globalFilterValue={filterValue}
			onGlobalFilterChange={onFilterChange}
			filterPlaceholder="Search warehouses…"
		/>
	);
}
