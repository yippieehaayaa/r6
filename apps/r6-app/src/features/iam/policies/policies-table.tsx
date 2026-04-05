import type { Policy } from "@r6/schemas";
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
	data: Policy[];
	isLoading: boolean;
	onEdit: (policy: Policy) => void;
	onDelete: (policy: Policy) => void;
	onRestore: (policy: Policy) => void;
	canUpdate: boolean;
	canDelete: boolean;
	canRestore: boolean;
	rowCount?: number;
	paginationState?: PaginationState;
	onPaginationChange?: OnChangeFn<PaginationState>;
	filterValue?: string;
	onFilterChange?: (value: string) => void;
}

export function PoliciesTable({
	data,
	isLoading,
	onEdit,
	onDelete,
	onRestore,
	canUpdate,
	canDelete,
	canRestore,
	rowCount,
	paginationState,
	onPaginationChange,
	filterValue,
	onFilterChange,
}: Props) {
	const columns = useMemo<ColumnDef<Policy>[]>(
		() => [
			{
				accessorKey: "name",
				header: "Name",
				cell: ({ row }) => (
					<span className="font-medium">{row.original.name}</span>
				),
			},
			{
				accessorKey: "effect",
				header: "Effect",
				cell: ({ row }) => (
					<Badge
						variant={
							row.original.effect === "ALLOW" ? "default" : "destructive"
						}
					>
						{row.original.effect}
					</Badge>
				),
			},
			{
				accessorKey: "permissions",
				header: "Permissions",
				cell: ({ row }) => (
					<span className="text-muted-foreground text-xs">
						{row.original.permissions.length} permission
						{row.original.permissions.length !== 1 ? "s" : ""}
					</span>
				),
			},
			{
				accessorKey: "audience",
				header: "Audience",
				cell: ({ row }) => (
					<div className="flex flex-wrap gap-1">
						{row.original.audience.map((a) => (
							<Badge key={a} variant="outline">
								{a}
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
					const policy = row.original;
					if (!canUpdate && !canDelete && !canRestore) return null;
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
									<DropdownMenuItem onSelect={() => onEdit(policy)}>
										<Pencil />
										Edit
									</DropdownMenuItem>
								)}
								{canDelete && !policy.deletedAt && (
									<DropdownMenuItem
										variant="destructive"
										onSelect={() => onDelete(policy)}
									>
										<Trash2 />
										Delete
									</DropdownMenuItem>
								)}
								{canRestore && policy.deletedAt && (
									<DropdownMenuItem onSelect={() => onRestore(policy)}>
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
		[canUpdate, canDelete, canRestore, onEdit, onDelete, onRestore],
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
			filterPlaceholder="Search policies…"
		/>
	);
}
