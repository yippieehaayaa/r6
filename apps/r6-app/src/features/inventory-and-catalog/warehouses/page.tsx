import type { PaginationState } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
	useDeleteWarehouseMutation,
	useListWarehousesQuery,
} from "@/api/inventory-and-catalog";
import { useAuth } from "@/auth";
import { Button } from "@/components/ui/button";
import { mapWarehouse, WarehousesTable } from "./warehouses-table";

const PAGE_SIZE = 20;

export default function WarehousesPage() {
	const { hasPermission } = useAuth();
	const canCreate = hasPermission("inventory:warehouse:create");
	const canDelete = hasPermission("inventory:warehouse:delete");

	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: PAGE_SIZE,
	});
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");

	useEffect(() => {
		const id = setTimeout(() => setDebouncedSearch(search), 300);
		return () => clearTimeout(id);
	}, [search]);

	const { data, isLoading } = useListWarehousesQuery({
		page: pagination.pageIndex + 1,
		limit: pagination.pageSize,
		search: debouncedSearch || undefined,
	});

	const deleteMutation = useDeleteWarehouseMutation();

	function handleDelete(id: string) {
		deleteMutation.mutate(id, {
			onSuccess: () => toast.success("Warehouse deleted."),
			onError: () => toast.error("Failed to delete warehouse."),
		});
	}

	const rows = (data?.data ?? []).map(mapWarehouse);

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
				<WarehousesTable
					data={rows}
					isLoading={isLoading}
					onDelete={handleDelete}
					canDelete={canDelete}
					rowCount={data?.total}
					paginationState={pagination}
					onPaginationChange={setPagination}
					filterValue={search}
					onFilterChange={(v) => {
						setSearch(v);
						setPagination((p) => ({ ...p, pageIndex: 0 }));
					}}
				/>
			</div>
		</div>
	);
}
