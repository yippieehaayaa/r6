import type { Policy } from "@r6/schemas";
import type {
	ColumnDef,
	OnChangeFn,
	PaginationState,
} from "@tanstack/react-table";
import { useMemo } from "react";
import { DataTable } from "@/components/table/data-table";
import { Badge } from "@/components/ui/badge";

interface Props {
	data: Policy[];
	isLoading: boolean;
	rowCount?: number;
	paginationState?: PaginationState;
	onPaginationChange?: OnChangeFn<PaginationState>;
	filterValue?: string;
	onFilterChange?: (value: string) => void;
}

export function PoliciesTable({
	data,
	isLoading,
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
					<div className="min-w-0">
						<p className="font-medium truncate">{row.original.name}</p>
						{row.original.description && (
							<p className="text-xs text-muted-foreground truncate mt-0.5">
								{row.original.description}
							</p>
						)}
					</div>
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
				accessorKey: "isManaged",
				header: "Managed",
				cell: ({ row }) =>
					row.original.isManaged ? (
						<Badge variant="secondary">Platform</Badge>
					) : null,
			},
			{
				accessorKey: "deletedAt",
				header: "Status",
				cell: ({ row }) =>
					row.original.deletedAt ? (
						<Badge variant="destructive">Deleted</Badge>
					) : (
						<Badge variant="default">Active</Badge>
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
		],
		[],
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


