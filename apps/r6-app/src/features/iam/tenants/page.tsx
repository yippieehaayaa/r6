import type { Tenant } from "@r6/schemas";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { PaginationState } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
	useListTenantsQuery,
	useRemoveTenantMutation,
	useRestoreTenantMutation,
} from "@/api/tenants";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api-error";
import { TenantSheet } from "./tenant-sheet";
import { TenantsTable } from "./tenants-table";

const PAGE_SIZE = 20;

export default function TenantsPage() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: PAGE_SIZE,
	});
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [sheetOpen, setSheetOpen] = useState(false);
	const [editTarget, setEditTarget] = useState<Tenant | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<Tenant | null>(null);

	useEffect(() => {
		const id = setTimeout(() => setDebouncedSearch(search), 300);
		return () => clearTimeout(id);
	}, [search]);

	const { data, isLoading } = useListTenantsQuery(
		{
			page: pagination.pageIndex + 1,
			limit: pagination.pageSize,
			search: debouncedSearch || undefined,
		},
		{ staleTime: 10 * 60 * 1000 },
	);

	const removeMutation = useRemoveTenantMutation();
	const restoreMutation = useRestoreTenantMutation();

	function handleEdit(tenant: Tenant) {
		setEditTarget(tenant);
		setSheetOpen(true);
	}

	function handleSheetOpenChange(open: boolean) {
		setSheetOpen(open);
		if (!open) setEditTarget(null);
	}

	function handleDelete(tenant: Tenant) {
		setDeleteTarget(tenant);
	}

	function confirmDelete() {
		if (!deleteTarget) return;
		removeMutation.mutate(deleteTarget.slug, {
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["tenants"] });
				toast.success("Tenant deleted.");
				setDeleteTarget(null);
			},
			onError: (err) => toast.error(getApiErrorMessage(err)),
		});
	}

	function handleRestore(tenant: Tenant) {
		restoreMutation.mutate(tenant.slug, {
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["tenants"] });
				toast.success("Tenant restored.");
			},
			onError: (err) => toast.error(getApiErrorMessage(err)),
		});
	}

	return (
		<div className="flex flex-1 flex-col gap-4 p-4 pt-0 animate-stagger-children">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-xl font-semibold">Tenants</h1>
					<p className="text-sm text-muted-foreground">
						Manage client organisations on the platform.
					</p>
				</div>
				<Button onClick={() => setSheetOpen(true)}>
					<Plus />
					New Tenant
				</Button>
			</div>

			<div className="rounded-xl border bg-card p-4">
				<TenantsTable
					data={data?.data ?? []}
					isLoading={isLoading}
					onEdit={handleEdit}
					onDelete={handleDelete}
					onRestore={handleRestore}
					onRowClick={(t) =>
						navigate({
							to: "/iam/tenants/$tenantSlug",
							params: { tenantSlug: t.slug },
						})
					}
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

			<TenantSheet
				open={sheetOpen}
				onOpenChange={handleSheetOpenChange}
				tenant={editTarget}
			/>

			<AlertDialog
				open={!!deleteTarget}
				onOpenChange={(open) => !open && setDeleteTarget(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete tenant?</AlertDialogTitle>
						<AlertDialogDescription>
							<strong>{deleteTarget?.name}</strong> will be soft-deleted. Their
							data will remain but access will be disabled.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction variant="destructive" onClick={confirmDelete}>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
