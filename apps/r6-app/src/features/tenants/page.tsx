import type { Tenant } from "@r6/schemas";
import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import {
	MailPlusIcon,
	PlusIcon,
	RotateCcwIcon,
	Trash2Icon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
	useListTenantsQuery,
	useRemoveTenantMutation,
	useRestoreTenantMutation,
} from "@/api/identity-and-access";
import { useAuth } from "@/auth";
import { Can } from "@/components/can";
import { DataTable } from "@/components/table/data-table";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api-error";
import { InviteSheet } from "./invite-sheet";
import { TenantSheet } from "./tenant-sheet";

export default function TenantsPage() {
	const { claims } = useAuth();

	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 20,
	});
	const [search, setSearch] = useState("");

	const [sheetOpen, setSheetOpen] = useState(false);
	const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

	const [inviteSheetOpen, setInviteSheetOpen] = useState(false);
	const [inviteTenantId, setInviteTenantId] = useState<string>("");

	const [deleteTarget, setDeleteTarget] = useState<Tenant | null>(null);

	const { data, isLoading } = useListTenantsQuery({
		page: pagination.pageIndex + 1,
		limit: pagination.pageSize,
		search: search || undefined,
	});

	const removeMutation = useRemoveTenantMutation();
	const restoreMutation = useRestoreTenantMutation();

	function openCreate() {
		setSelectedTenant(null);
		setSheetOpen(true);
	}

	function openEdit(tenant: Tenant) {
		setSelectedTenant(tenant);
		setSheetOpen(true);
	}

	function openInvite(tenantId: string) {
		setInviteTenantId(tenantId);
		setInviteSheetOpen(true);
	}

	async function handleDelete() {
		if (!deleteTarget) return;
		try {
			await removeMutation.mutateAsync(deleteTarget.id);
			toast.success(`Tenant "${deleteTarget.name}" removed.`);
		} catch (err) {
			toast.error(getApiErrorMessage(err));
		} finally {
			setDeleteTarget(null);
		}
	}

	async function handleRestore(tenant: Tenant) {
		try {
			await restoreMutation.mutateAsync(tenant.id);
			toast.success(`Tenant "${tenant.name}" restored.`);
		} catch (err) {
			toast.error(getApiErrorMessage(err));
		}
	}

	const columns: ColumnDef<Tenant>[] = [
		{
			accessorKey: "name",
			header: "Name",
			cell: ({ getValue }) => (
				<span className="font-medium text-[var(--text-primary)]">
					{getValue() as string}
				</span>
			),
		},
		{
			accessorKey: "slug",
			header: "Slug",
			cell: ({ getValue }) => (
				<span className="font-mono text-sm text-[var(--text-secondary)]">
					{getValue() as string}
				</span>
			),
		},
		{
			accessorKey: "isActive",
			header: "Status",
			cell: ({ getValue }) => {
				const active = getValue() as boolean;
				return active ? (
					<Badge
						variant="outline"
						className="text-xs border bg-[var(--badge-in-stock)]/15 text-[var(--badge-in-stock)] border-[var(--badge-in-stock)]/30"
					>
						Active
					</Badge>
				) : (
					<Badge
						variant="outline"
						className="text-xs border bg-[var(--badge-out-of-stock)]/15 text-[var(--badge-out-of-stock)] border-[var(--badge-out-of-stock)]/30"
					>
						Inactive
					</Badge>
				);
			},
		},
		{
			accessorKey: "isPlatform",
			header: "Platform",
			cell: ({ getValue }) =>
				getValue() ? (
					<Badge variant="secondary" className="text-xs">
						Platform
					</Badge>
				) : null,
		},
		{
			accessorKey: "moduleAccess",
			header: "Modules",
			cell: ({ getValue }) => {
				const modules = getValue() as string[];
				if (!modules.length)
					return (
						<span className="text-[var(--text-secondary)] text-xs">—</span>
					);
				return (
					<div className="flex flex-wrap gap-1">
						{modules.map((m) => (
							<Badge key={m} variant="outline" className="text-xs capitalize">
								{m}
							</Badge>
						))}
					</div>
				);
			},
		},
		{
			id: "actions",
			header: "",
			cell: ({ row }) => {
				const tenant = row.original;
				const isDeleted = !!tenant.deletedAt;
				return (
					<div className="flex items-center justify-end gap-1">
						<Can permission="iam:invitation:create">
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 text-[var(--text-secondary)]"
								onClick={(e) => {
									e.stopPropagation();
									openInvite(tenant.id);
								}}
								title="Invite user"
							>
								<MailPlusIcon className="size-3.5" />
							</Button>
						</Can>
						{isDeleted ? (
							<Can permission="iam:tenant:restore">
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 text-[var(--text-secondary)]"
									onClick={(e) => {
										e.stopPropagation();
										handleRestore(tenant);
									}}
									title="Restore tenant"
								>
									<RotateCcwIcon className="size-3.5" />
								</Button>
							</Can>
						) : (
							<Can permission="iam:tenant:delete">
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 text-[var(--badge-out-of-stock)] hover:text-[var(--badge-out-of-stock)] hover:bg-[var(--badge-out-of-stock)]/10"
									onClick={(e) => {
										e.stopPropagation();
										setDeleteTarget(tenant);
									}}
									title="Remove tenant"
								>
									<Trash2Icon className="size-3.5" />
								</Button>
							</Can>
						)}
					</div>
				);
			},
		},
	];

	return (
		<div className="animate-apple-enter flex flex-1 flex-col gap-6 p-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
						Tenants
					</h1>
					<p className="mt-1 text-sm text-[var(--text-secondary)]">
						Manage platform tenants and their configurations
					</p>
				</div>
				<Can permission="iam:tenant:create">
					<Button
						onClick={openCreate}
						className="bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white border-0 shadow-sm"
					>
						<PlusIcon className="size-4" />
						New Tenant
					</Button>
				</Can>
			</div>

			<DataTable
				columns={columns}
				data={data?.data ?? []}
				isLoading={isLoading}
				rowCount={data?.total}
				paginationState={pagination}
				onPaginationChange={setPagination}
				globalFilterValue={search}
				onGlobalFilterChange={setSearch}
				filterPlaceholder="Search tenants…"
				onRowClick={openEdit}
			/>

			<TenantSheet
				open={sheetOpen}
				onOpenChange={setSheetOpen}
				mode={selectedTenant ? "edit" : "create"}
				tenant={selectedTenant ?? undefined}
			/>

			<InviteSheet
				open={inviteSheetOpen}
				onOpenChange={setInviteSheetOpen}
				tenantId={inviteTenantId}
			/>

			<AlertDialog
				open={!!deleteTarget}
				onOpenChange={(open) => !open && setDeleteTarget(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Remove tenant?</AlertDialogTitle>
						<AlertDialogDescription>
							<strong>{deleteTarget?.name}</strong> will be soft-deleted. All
							associated data remains accessible to administrators.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Remove
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
