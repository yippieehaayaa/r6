import type { Policy } from "@r6/schemas";
import type {
	ColumnDef,
	OnChangeFn,
	PaginationState,
} from "@tanstack/react-table";
import { useMemo } from "react";
import { DataTable } from "@/components/table/data-table";
import { Badge } from "@/components/ui/badge";

interface PoliciesTableProps {
	data: Policy[];
	isLoading: boolean;
	rowCount?: number;
	paginationState?: PaginationState;
	onPaginationChange?: OnChangeFn<PaginationState>;
	globalFilterValue?: string;
	onGlobalFilterChange?: (value: string) => void;
}

export function PoliciesTable({
	data,
	isLoading,
	rowCount,
	paginationState,
	onPaginationChange,
	globalFilterValue,
	onGlobalFilterChange,
}: PoliciesTableProps) {
	const columns = useMemo<ColumnDef<Policy>[]>(
		() => [
			{
				accessorKey: "name",
				header: "Name",
				cell: ({ row }) => (
					<span className="font-medium text-[var(--text-primary)]">
						{row.original.name}
					</span>
				),
			},
			{
				accessorKey: "displayName",
				header: "Display Name",
				cell: ({ row }) =>
					row.original.displayName ? (
						<span className="text-sm">{row.original.displayName}</span>
					) : (
						<span className="text-xs text-muted-foreground">—</span>
					),
			},
			{
				accessorKey: "description",
				header: "Description",
				cell: ({ row }) =>
					row.original.description ? (
						<span className="line-clamp-2 max-w-xs text-sm text-muted-foreground">
							{row.original.description}
						</span>
					) : (
						<span className="text-xs text-muted-foreground">—</span>
					),
			},
			{
				id: "permissions",
				header: "Permissions",
				cell: ({ row }) => {
					const perms = row.original.permissions;
					return (
						<div className="flex flex-wrap gap-1 max-w-xs">
							{perms.slice(0, 3).map((p) => (
								<Badge
									key={p}
									variant="outline"
									className="h-5 px-1.5 text-[10px]"
								>
									{p}
								</Badge>
							))}
							{perms.length > 3 && (
								<Badge variant="outline" className="h-5 px-1.5 text-[10px]">
									+{perms.length - 3}
								</Badge>
							)}
						</div>
					);
				},
			},
			{
				accessorKey: "isManaged",
				header: "Type",
				cell: ({ row }) =>
					row.original.isManaged ? (
						<Badge variant="secondary" className="text-[10px]">
							Managed
						</Badge>
					) : (
						<Badge variant="outline" className="text-[10px]">
							Custom
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
			rowCount={rowCount}
			paginationState={paginationState}
			onPaginationChange={onPaginationChange}
			globalFilterValue={globalFilterValue}
			onGlobalFilterChange={onGlobalFilterChange}
			filterPlaceholder="Search policies…"
		/>
	);
}
