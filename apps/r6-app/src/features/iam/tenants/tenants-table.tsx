import type { Tenant } from "@r6/schemas";
import type {
	ColumnDef,
	OnChangeFn,
	PaginationState,
} from "@tanstack/react-table";
import { MoreHorizontal, Pencil, RotateCcw, Trash2 } from "lucide-react";
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

interface Props {
	data: Tenant[];
	isLoading: boolean;
	onEdit: (tenant: Tenant) => void;
	onDelete: (tenant: Tenant) => void;
	onRestore: (tenant: Tenant) => void;
	rowCount?: number;
	paginationState?: PaginationState;
	onPaginationChange?: OnChangeFn<PaginationState>;
	filterValue?: string;
	onFilterChange?: (value: string) => void;
}

export function TenantsTable({
	data,
	isLoading,
	onEdit,
	onDelete,
	onRestore,
	rowCount,
	paginationState,
	onPaginationChange,
	filterValue,
	onFilterChange,
}: Props) {
	const columns = useMemo<ColumnDef<Tenant>[]>(
		() => [
			{
				accessorKey: "name",
				header: "Name",
				cell: ({ row }) => (
					<span className="font-medium">{row.original.name}</span>
				),
			},
			{
				accessorKey: "slug",
				header: "Slug",
				cell: ({ row }) => (
					<span className="font-mono text-xs text-muted-foreground">
						{row.original.slug}
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
				accessorKey: "moduleAccess",
				header: "Modules",
				cell: ({ row }) => (
					<div className="flex flex-wrap gap-1">
						{row.original.moduleAccess.map((m) => (
							<Badge key={m} variant="outline">
								{m}
							</Badge>
						))}
					</div>
				),
			},
			{
				accessorKey: "createdAt",
				header: "Created",
				cell: ({ row }) => (
					<span className="text-muted-foreground text-xs">
						{new Date(row.original.createdAt).toLocaleDateString()}
					</span>
				),
			},
			{
				id: "actions",
				header: "",
				enableHiding: false,
				enableSorting: false,
				cell: ({ row }) => {
					const tenant = row.original;
					return (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="icon-sm">
									<MoreHorizontal />
									<span className="sr-only">Open menu</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem onSelect={() => onEdit(tenant)}>
									<Pencil />
									Edit
								</DropdownMenuItem>
								{tenant.deletedAt ? (
									<DropdownMenuItem onSelect={() => onRestore(tenant)}>
										<RotateCcw />
										Restore
									</DropdownMenuItem>
								) : (
									<DropdownMenuItem
										variant="destructive"
										onSelect={() => onDelete(tenant)}
									>
										<Trash2 />
										Delete
									</DropdownMenuItem>
								)}
							</DropdownMenuContent>
						</DropdownMenu>
					);
				},
			},
		],
		[onEdit, onDelete, onRestore],
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
			filterPlaceholder="Search tenants…"
		/>
	);
}
