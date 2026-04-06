import type { IdentitySafe } from "@r6/schemas";
import { useQueryClient } from "@tanstack/react-query";
import type { PaginationState } from "@tanstack/react-table";
import { Building2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
	useListIdentitiesQuery,
	useRemoveIdentityMutation,
	useRestoreIdentityMutation,
} from "@/api/identities";
import { useListTenantsQuery } from "@/api/tenants";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { getApiErrorMessage } from "@/lib/api-error";
import { IdentitiesTable } from "./identities-table";
import { IdentitySheet } from "./identity-sheet";
import { ManageRolesSheet } from "./manage-roles-sheet";

const PAGE_SIZE = 20;

export default function IdentitiesPage() {
	const { claims, hasPermission } = useAuth();
	const isAdmin = claims?.kind === "ADMIN";
	const canCreate = !isAdmin && hasPermission("iam:identity:create");
	const canUpdate = !isAdmin && hasPermission("iam:identity:update");
	const canDelete = !isAdmin && hasPermission("iam:identity:delete");
	const canManageRoles = !isAdmin && hasPermission("iam:identity:update");
	// For tenant-owners the slug comes from the JWT; for admins they pick a tenant.
	const [selectedTenantSlug, setSelectedTenantSlug] = useState<string>(
		claims?.tenantSlug ?? "",
	);
	const activeTenantSlug = isAdmin
		? selectedTenantSlug
		: (claims?.tenantSlug ?? "");
	const queryClient = useQueryClient();

	const { data: tenantsData } = useListTenantsQuery(
		{ limit: 100 },
		{ staleTime: 5 * 60 * 1000, enabled: isAdmin },
	);

	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: PAGE_SIZE,
	});
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [sheetOpen, setSheetOpen] = useState(false);
	const [editTarget, setEditTarget] = useState<IdentitySafe | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<IdentitySafe | null>(null);
	const [manageRolesTarget, setManageRolesTarget] =
		useState<IdentitySafe | null>(null);

	useEffect(() => {
		const id = setTimeout(() => setDebouncedSearch(search), 300);
		return () => clearTimeout(id);
	}, [search]);

	const { data, isLoading } = useListIdentitiesQuery(
		activeTenantSlug,
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
			{ tenantSlug: activeTenantSlug, id: deleteTarget.id },
			{
				onSuccess: () => {
					queryClient.invalidateQueries({
						queryKey: ["identities", activeTenantSlug],
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
			{ tenantSlug: activeTenantSlug, id: identity.id },
			{
				onSuccess: () => {
					queryClient.invalidateQueries({
						queryKey: ["identities", activeTenantSlug],
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

			<div className="rounded-xl border bg-card p-4">
				{isAdmin && !activeTenantSlug ? (
					<div className="flex flex-col items-center justify-center gap-4 py-16 text-center animate-stagger-children">
						<Building2 className="h-10 w-10 text-muted-foreground/50" />
						<div>
							<p className="font-medium">No tenant selected</p>
							<p className="text-sm text-muted-foreground">
								Choose a tenant to view its identities.
							</p>
						</div>
						<Select
							value={selectedTenantSlug}
							onValueChange={(v) => {
								setSelectedTenantSlug(v);
								setPagination((p) => ({ ...p, pageIndex: 0 }));
							}}
						>
							<SelectTrigger className="w-64">
								<SelectValue placeholder="Select a tenant…" />
							</SelectTrigger>
							<SelectContent>
								{(tenantsData?.data ?? []).map((t) => (
									<SelectItem key={t.slug} value={t.slug}>
										{t.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				) : (
					<IdentitiesTable
						key={activeTenantSlug}
						data={data?.data ?? []}
						isLoading={isLoading}
						onEdit={handleEdit}
						onDelete={handleDelete}
						onRestore={handleRestore}
					onManageRoles={setManageRolesTarget}
					canUpdate={canUpdate}
					canDelete={canDelete}
					canManageRoles={canManageRoles}
						rowCount={data?.total}
						paginationState={pagination}
						onPaginationChange={setPagination}
						filterValue={search}
						onFilterChange={(v) => {
							setSearch(v);
							setPagination((p) => ({ ...p, pageIndex: 0 }));
						}}
					/>
				)}
			</div>

			<IdentitySheet
				open={sheetOpen}
				onOpenChange={handleSheetOpenChange}
				tenantSlug={activeTenantSlug}
				identity={editTarget}
			/>

			<ManageRolesSheet
				open={!!manageRolesTarget}
				onOpenChange={(open) => !open && setManageRolesTarget(null)}
				tenantSlug={activeTenantSlug}
				identity={manageRolesTarget}
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
