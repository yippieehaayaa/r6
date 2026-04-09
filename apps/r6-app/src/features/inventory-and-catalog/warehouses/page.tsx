import type { Warehouse } from "@r6/schemas";
import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import { MoreHorizontal, Plus } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import {
	useDeleteWarehouseMutation,
	useListWarehousesQuery,
} from "@/api/inventory-and-catalog";
import { useAuth } from "@/auth";
import { DataTable } from "@/components/table/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WarehouseRow {
	id: string;
	name: string;
	location: string;
	capacity: number;
	status: string;
	createdAt: string;
}

function mapWarehouse(w: Warehouse): WarehouseRow {
	return {
		id: w.id,
		name: w.name,
		location: w.address?.city ?? w.address?.country ?? "—",
		capacity: 0,
		status: w.isActive ? "Active" : "Inactive",
		createdAt: w.createdAt,
	};
}

export default function WarehousesPage() {
	const { hasPermission } = useAuth();
	const canCreate = hasPermission("inventory:warehouse:create");
	const canDelete = hasPermission("inventory:warehouse:delete");

	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 20,
	});

	const { data, isLoading } = useListWarehousesQuery({
		page: pagination.pageIndex + 1,
		limit: pagination.pageSize,
	});

	const deleteMutation = useDeleteWarehouseMutation();

	const handleDelete = useCallback(
		(id: string) => {
			deleteMutation.mutate(id, {
				onSuccess: () => toast.success("Warehouse deleted."),
				onError: () => toast.error("Failed to delete warehouse."),
			});
		},
		[deleteMutation],
	);

	const rows = useMemo(() => (data?.data ?? []).map(mapWarehouse), [data]);

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
							cell: ({ row }: { row: { original: WarehouseRow } }) => (
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="icon" className="size-8">
											<MoreHorizontal className="size-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem
											className="text-destructive"
											onClick={() => handleDelete(row.original.id)}
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
		[canDelete, handleDelete],
	);

	return (
		<div className="flex flex-1 flex-col gap-4 p-4 pt-0 animate-stagger-children">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-xl font-semibold">Warehouses</h1>
					<p className="text-sm text-muted-foreground">
						Manage your warehouse locations and capacity.
					</p>
				</div>
				{canCreate && (
					<Button onClick={() => {}}>
						<Plus className="size-4" />
						Add Warehouse
					</Button>
				)}
			</div>

			<div className="rounded-xl border bg-card p-4">
				<DataTable
					columns={columns}
					data={rows}
					isLoading={isLoading}
					rowCount={data?.total}
					paginationState={pagination}
					onPaginationChange={setPagination}
				/>
			</div>
		</div>
	);
}
