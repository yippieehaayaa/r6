import type { Tenant } from "@r6/schemas";
import { useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useState } from "react";
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
import { TenantSheet } from "./tenant-sheet";
import { TenantsTable } from "./tenants-table";

const PAGE_SIZE = 20;

export default function TenantsPage() {
	const queryClient = useQueryClient();

	const [page, setPage] = useState(1);
	const [sheetOpen, setSheetOpen] = useState(false);
	const [editTarget, setEditTarget] = useState<Tenant | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<Tenant | null>(null);

	const { data, isLoading } = useListTenantsQuery(
		{ page, limit: PAGE_SIZE },
		{ staleTime: 10 * 60 * 1000 },
	);

	const removeMutation = useRemoveTenantMutation();
	const restoreMutation = useRestoreTenantMutation();

	const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1;

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
			onError: (err) =>
				toast.error(
					(err as AxiosError<{ message: string }>).response?.data?.message ??
						err.message,
				),
		});
	}

	function handleRestore(tenant: Tenant) {
		restoreMutation.mutate(tenant.slug, {
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["tenants"] });
				toast.success("Tenant restored.");
			},
			onError: (err) =>
				toast.error(
					(err as AxiosError<{ message: string }>).response?.data?.message ??
						err.message,
				),
		});
	}

	return (
		<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
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

			<div className="rounded-xl border bg-card overflow-hidden">
				<TenantsTable
					data={data?.data ?? []}
					isLoading={isLoading}
					onEdit={handleEdit}
					onDelete={handleDelete}
					onRestore={handleRestore}
				/>
			</div>

			{(data?.total ?? 0) > PAGE_SIZE && (
				<div className="flex items-center justify-between text-sm text-muted-foreground">
					<span>
						Page {page} of {totalPages}
					</span>
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="icon-sm"
							disabled={page <= 1}
							onClick={() => setPage((p) => p - 1)}
						>
							<ChevronLeft />
						</Button>
						<Button
							variant="outline"
							size="icon-sm"
							disabled={page >= totalPages}
							onClick={() => setPage((p) => p + 1)}
						>
							<ChevronRight />
						</Button>
					</div>
				</div>
			)}

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
