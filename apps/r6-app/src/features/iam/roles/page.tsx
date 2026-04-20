import type { Role } from "@r6/schemas";
import { IAM_PERMISSIONS } from "@r6/schemas";
import { useQueryClient } from "@tanstack/react-query";
import type { PaginationState } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
	useListRolesQuery,
	useRemoveRoleMutation,
	useRestoreRoleMutation,
} from "@/api/identity-and-access/roles";
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
import { RoleSheet } from "./role-sheet";
import { RolesTable } from "./roles-table";

const PAGE_SIZE = 20;

export default function RolesPage() {
	const { claims, hasPermission } = useAuth();
	const canCreate = hasPermission(IAM_PERMISSIONS.ROLE_CREATE);
	const canUpdate = hasPermission(IAM_PERMISSIONS.ROLE_UPDATE);
	const canDelete = hasPermission(IAM_PERMISSIONS.ROLE_DELETE);
	const canRestore = hasPermission(IAM_PERMISSIONS.ROLE_RESTORE);
	const activeTenantId = claims?.tenantId ?? "";
	const queryClient = useQueryClient();

	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: PAGE_SIZE,
	});
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [sheetOpen, setSheetOpen] = useState(false);
	const [editTarget, setEditTarget] = useState<Role | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);

	useEffect(() => {
		const id = setTimeout(() => setDebouncedSearch(search), 300);
		return () => clearTimeout(id);
	}, [search]);

	const { data, isLoading } = useListRolesQuery(
		activeTenantId,
		{
			page: pagination.pageIndex + 1,
			limit: pagination.pageSize,
			search: debouncedSearch || undefined,
		},
		{ staleTime: 5 * 60 * 1000 },
	);

	const removeMutation = useRemoveRoleMutation();
	const restoreMutation = useRestoreRoleMutation();

	function handleEdit(role: Role) {
		if (!canUpdate) return;
		setEditTarget(role);
		setSheetOpen(true);
	}

	function handleSheetOpenChange(open: boolean) {
		setSheetOpen(open);
		if (!open) setEditTarget(null);
	}

	function handleDelete(role: Role) {
		setDeleteTarget(role);
	}

	function confirmDelete() {
		if (!deleteTarget || !canDelete) return;
		removeMutation.mutate(
			{ tenantId: activeTenantId, id: deleteTarget.id },
			{
				onSuccess: () => {
					queryClient.invalidateQueries({
						queryKey: ["roles", activeTenantId],
					});
					toast.success("Role deleted.");
					setDeleteTarget(null);
				},
				onError: (err) => toast.error(getApiErrorMessage(err)),
			},
		);
	}

	function handleRestore(role: Role) {
		if (!canRestore) return;
		restoreMutation.mutate(
			{ tenantId: activeTenantId, id: role.id },
			{
				onSuccess: () => {
					queryClient.invalidateQueries({
						queryKey: ["roles", activeTenantId],
					});
					toast.success("Role restored.");
				},
				onError: (err) => toast.error(getApiErrorMessage(err)),
			},
		);
	}

	return (
		<div className="flex flex-1 flex-col gap-4 p-4 pt-0 animate-stagger-children">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-xl font-semibold">Roles</h1>
					<p className="text-sm text-muted-foreground">
						Named permission groups assigned to identities.
					</p>
				</div>
				{canCreate && (
					<Button onClick={() => setSheetOpen(true)}>
						<Plus />
						New Role
					</Button>
				)}
			</div>

			<div className="rounded-xl border-default bg-surface p-4">
				<RolesTable
					key={activeTenantId}
					data={data?.data ?? []}
					isLoading={isLoading}
					onEdit={handleEdit}
					onDelete={handleDelete}
					onRestore={handleRestore}
					canUpdate={canUpdate}
					canDelete={canDelete}
					canRestore={canRestore}
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

			<RoleSheet
				open={sheetOpen}
				onOpenChange={handleSheetOpenChange}
				tenantId={activeTenantId}
				role={editTarget}
			/>

			<AlertDialog
				open={!!deleteTarget}
				onOpenChange={(open) => !open && setDeleteTarget(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete role?</AlertDialogTitle>
						<AlertDialogDescription>
							<strong>{deleteTarget?.name}</strong> will be soft-deleted. Any
							identities currently assigned this role will lose its permissions.
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
