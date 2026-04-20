import type { IdentitySafe } from "@r6/schemas";
import { useQueryClient } from "@tanstack/react-query";
import type { PaginationState } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
	useListIdentitiesQuery,
	useRemoveIdentityMutation,
	useRestoreIdentityMutation,
} from "@/api/identity-and-access/identities";
import { useAuth } from "@/auth";
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
import { IdentitiesTable } from "./identities-table";
import { IdentitySheet } from "./identity-sheet";

const PAGE_SIZE = 20;

export default function IdentitiesPage() {
	const { claims, hasPermission } = useAuth();
	const canCreate = hasPermission("iam:identity:create");
	const canUpdate = hasPermission("iam:identity:update");
	const canDelete = hasPermission("iam:identity:delete");
	const activeTenantId = claims?.tenantId ?? "";
	const queryClient = useQueryClient();

	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: PAGE_SIZE,
	});
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [sheetOpen, setSheetOpen] = useState(false);
	const [editTarget, setEditTarget] = useState<IdentitySafe | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<IdentitySafe | null>(null);

	useEffect(() => {
		const id = setTimeout(() => setDebouncedSearch(search), 300);
		return () => clearTimeout(id);
	}, [search]);

	const { data, isLoading } = useListIdentitiesQuery(
		activeTenantId,
		{
			page: pagination.pageIndex + 1,
			limit: pagination.pageSize,
			search: debouncedSearch || undefined,
		},
		{ staleTime: 5 * 60 * 1000 },
	);

	const removeMutation = useRemoveIdentityMutation();
	const restoreMutation = useRestoreIdentityMutation();

	function handleEdit(identity: IdentitySafe) {
		if (!canUpdate) return;
		setEditTarget(identity);
		setSheetOpen(true);
	}

	function handleSheetOpenChange(open: boolean) {
		setSheetOpen(open);
		if (!open) setEditTarget(null);
	}

	function handleDelete(identity: IdentitySafe) {
		setDeleteTarget(identity);
	}

	function confirmDelete() {
		if (!deleteTarget || !canDelete) return;
		removeMutation.mutate(
			{ tenantId: activeTenantId, id: deleteTarget.id },
			{
				onSuccess: () => {
					queryClient.invalidateQueries({
						queryKey: ["identities", activeTenantId],
					});
					toast.success("Identity deleted.");
					setDeleteTarget(null);
				},
				onError: (err) => toast.error(getApiErrorMessage(err)),
			},
		);
	}

	function handleRestore(identity: IdentitySafe) {
		if (!canDelete) return;
		restoreMutation.mutate(
			{ tenantId: activeTenantId, id: identity.id },
			{
				onSuccess: () => {
					queryClient.invalidateQueries({
						queryKey: ["identities", activeTenantId],
					});
					toast.success("Identity restored.");
				},
				onError: (err) => toast.error(getApiErrorMessage(err)),
			},
		);
	}

	return (
		<div className="flex flex-1 flex-col gap-4 p-4 pt-0 animate-stagger-children">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-xl font-semibold">Identities</h1>
					<p className="text-sm text-muted-foreground">
						Manage user and service accounts.
					</p>
				</div>
				{canCreate && (
					<Button onClick={() => setSheetOpen(true)}>
						<Plus />
						New Identity
					</Button>
				)}
			</div>

			<div className="rounded-xl border-default bg-surface p-4">
				<IdentitiesTable
					key={activeTenantId}
					data={data?.data ?? []}
					isLoading={isLoading}
					onEdit={handleEdit}
					onDelete={handleDelete}
					onRestore={handleRestore}
					canUpdate={canUpdate}
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

			<IdentitySheet
				open={sheetOpen}
				onOpenChange={handleSheetOpenChange}
				tenantId={activeTenantId}
				identity={editTarget}
			/>

			<AlertDialog
				open={!!deleteTarget}
				onOpenChange={(open) => !open && setDeleteTarget(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete identity?</AlertDialogTitle>
						<AlertDialogDescription>
							<strong>{deleteTarget?.username}</strong> will be soft-deleted and
							can be restored later by an administrator.
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
