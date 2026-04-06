import type { Role } from "@r6/schemas";
import type {
	ColumnDef,
	OnChangeFn,
	PaginationState,
} from "@tanstack/react-table";
import { MoreHorizontal, Pencil, RotateCcw, ShieldCheck, Trash2 } from "lucide-react";
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
	data: Role[];
	isLoading: boolean;
	onEdit: (role: Role) => void;
	onDelete: (role: Role) => void;
	onRestore: (role: Role) => void;
	onManagePolicies: (role: Role) => void;
	canUpdate: boolean;
	canDelete: boolean;
	canRestore: boolean;
	canManagePolicies: boolean;
	rowCount?: number;
	paginationState?: PaginationState;
	onPaginationChange?: OnChangeFn<PaginationState>;
	filterValue?: string;
	onFilterChange?: (value: string) => void;
}

export function RolesTable({
	data,
	isLoading,
	onEdit,
	onDelete,
	onRestore,
	onManagePolicies,
	canUpdate,
	canDelete,
	canRestore,
	canManagePolicies,
	rowCount,
	paginationState,
	onPaginationChange,
	filterValue,
	onFilterChange,
}: Props) {
	const columns = useMemo<ColumnDef<Role>[]>(
		() => [
			{
				accessorKey: "name",
				header: "Name",
				cell: ({ row }) => (
					<span className="font-medium">{row.original.name}</span>
				),
			},
			{
				accessorKey: "description",
				header: "Description",
				cell: ({ row }) => (
					<span className="text-muted-foreground">
						{row.original.description ?? "—"}
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
					const role = row.original;
					if (!canUpdate && !canDelete && !canRestore && !canManagePolicies) return null;
					return (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="icon-sm">
									<MoreHorizontal />
									<span className="sr-only">Open menu</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								{canUpdate && (
									<DropdownMenuItem onSelect={() => onEdit(role)}>
										<Pencil />
										Edit
									</DropdownMenuItem>
								)}
								{canManagePolicies && !role.deletedAt && (
									<DropdownMenuItem onSelect={() => onManagePolicies(role)}>
										<ShieldCheck />
										Manage Policies
									</DropdownMenuItem>
								)}
								{canDelete && !role.deletedAt && (
									<DropdownMenuItem
										variant="destructive"
										onSelect={() => onDelete(role)}
									>
										<Trash2 />
										Delete
									</DropdownMenuItem>
								)}
								{canRestore && role.deletedAt && (
									<DropdownMenuItem onSelect={() => onRestore(role)}>
										<RotateCcw />
										Restore
									</DropdownMenuItem>
								)}
							</DropdownMenuContent>
						</DropdownMenu>
					);
				},
			},
		],
		[canUpdate, canDelete, canRestore, canManagePolicies, onEdit, onDelete, onRestore, onManagePolicies],
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
			filterPlaceholder="Search roles…"
		/>
	);
}
