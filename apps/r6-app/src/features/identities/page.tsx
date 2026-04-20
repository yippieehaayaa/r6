import type { IdentitySafe } from "@r6/schemas";
import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import { PlusIcon, RotateCcwIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
	useListIdentitiesQuery,
	useRemoveIdentityMutation,
	useRestoreIdentityMutation,
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
import { IdentitySheet } from "./identity-sheet";

// ── Status badge ──────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
	ACTIVE:
		"bg-[var(--badge-in-stock)]/15 text-[var(--badge-in-stock)] border-[var(--badge-in-stock)]/30",
	PENDING_VERIFICATION:
		"bg-[var(--badge-low-stock)]/15 text-[var(--badge-low-stock)] border-[var(--badge-low-stock)]/30",
	INACTIVE:
		"bg-[var(--badge-out-of-stock)]/15 text-[var(--badge-out-of-stock)] border-[var(--badge-out-of-stock)]/30",
	SUSPENDED:
		"bg-[var(--badge-out-of-stock)]/15 text-[var(--badge-out-of-stock)] border-[var(--badge-out-of-stock)]/30",
};

const STATUS_LABELS: Record<string, string> = {
	ACTIVE: "Active",
	PENDING_VERIFICATION: "Pending",
	INACTIVE: "Inactive",
	SUSPENDED: "Suspended",
};

// ── Component ─────────────────────────────────────────────────

export default function IdentitiesPage() {
	const { claims } = useAuth();
	const tenantId = claims?.tenantId ?? "";

	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 20,
	});
	const [search, setSearch] = useState("");

	// Sheet state
	const [sheetOpen, setSheetOpen] = useState(false);
	const [selectedIdentity, setSelectedIdentity] = useState<IdentitySafe | null>(
		null,
	);

	// Confirm delete state
	const [deleteTarget, setDeleteTarget] = useState<IdentitySafe | null>(null);

	const { data, isLoading } = useListIdentitiesQuery(tenantId, {
		page: pagination.pageIndex + 1,
		limit: pagination.pageSize,
		search: search || undefined,
	});

	const removeMutation = useRemoveIdentityMutation();
	const restoreMutation = useRestoreIdentityMutation();

	function openCreate() {
		setSelectedIdentity(null);
		setSheetOpen(true);
	}

	function openEdit(identity: IdentitySafe) {
		setSelectedIdentity(identity);
		setSheetOpen(true);
	}

	async function handleDelete() {
		if (!deleteTarget) return;
		try {
			await removeMutation.mutateAsync({ tenantId, id: deleteTarget.id });
			toast.success(`${deleteTarget.username} removed.`);
		} catch (err) {
			toast.error(getApiErrorMessage(err));
		} finally {
			setDeleteTarget(null);
		}
	}

	async function handleRestore(identity: IdentitySafe) {
		try {
			await restoreMutation.mutateAsync({ tenantId, id: identity.id });
			toast.success(`${identity.username} restored.`);
		} catch (err) {
			toast.error(getApiErrorMessage(err));
		}
	}

	const columns: ColumnDef<IdentitySafe>[] = [
		{
			id: "name",
			header: "Name",
			accessorFn: (row) =>
				[row.firstName, row.middleName, row.lastName].filter(Boolean).join(" "),
			cell: ({ row }) => {
				const { firstName, middleName, lastName } = row.original;
				const name = [firstName, middleName, lastName]
					.filter(Boolean)
					.join(" ");
				return (
					<span className="font-medium text-[var(--text-primary)]">{name}</span>
				);
			},
		},
		{
			accessorKey: "username",
			header: "Username",
			cell: ({ getValue }) => (
				<span className="font-mono text-sm text-[var(--text-secondary)]">
					{getValue() as string}
				</span>
			),
		},
		{
			accessorKey: "email",
			header: "Email",
			cell: ({ getValue }) => (
				<span className="text-sm text-[var(--text-secondary)]">
					{getValue() as string}
				</span>
			),
		},
		{
			accessorKey: "status",
			header: "Status",
			cell: ({ getValue }) => {
				const status = getValue() as string;
				return (
					<Badge
						variant="outline"
						className={`text-xs border ${STATUS_COLORS[status] ?? ""}`}
					>
						{STATUS_LABELS[status] ?? status}
					</Badge>
				);
			},
		},
		{
			accessorKey: "kind",
			header: "Kind",
			cell: ({ getValue }) => (
				<Badge variant="secondary" className="text-xs">
					{getValue() as string}
				</Badge>
			),
		},
		{
			id: "actions",
			header: "",
			cell: ({ row }) => {
				const identity = row.original;
				const isDeleted = !!identity.deletedAt;
				return (
					<div className="flex items-center justify-end gap-1">
						{isDeleted ? (
							<Can permission="iam:identity:restore">
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 text-[var(--text-secondary)]"
									onClick={(e) => {
										e.stopPropagation();
										handleRestore(identity);
									}}
									title="Restore identity"
								>
									<RotateCcwIcon className="size-3.5" />
								</Button>
							</Can>
						) : (
							<Can permission="iam:identity:delete">
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 text-[var(--badge-out-of-stock)] hover:text-[var(--badge-out-of-stock)] hover:bg-[var(--badge-out-of-stock)]/10"
									onClick={(e) => {
										e.stopPropagation();
										setDeleteTarget(identity);
									}}
									title="Remove identity"
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
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
						Identities
					</h1>
					<p className="mt-1 text-sm text-[var(--text-secondary)]">
						Manage users and service accounts within this tenant
					</p>
				</div>
				<Can permission="iam:identity:create">
					<Button
						onClick={openCreate}
						className="bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white border-0 shadow-sm"
					>
						<PlusIcon className="size-4" />
						New Identity
					</Button>
				</Can>
			</div>

			{/* Table */}
			<DataTable
				columns={columns}
				data={data?.data ?? []}
				isLoading={isLoading}
				rowCount={data?.total}
				paginationState={pagination}
				onPaginationChange={setPagination}
				globalFilterValue={search}
				onGlobalFilterChange={setSearch}
				filterPlaceholder="Search by name, username or email…"
				onRowClick={openEdit}
			/>

			{/* Create / Edit sheet */}
			<IdentitySheet
				open={sheetOpen}
				onOpenChange={setSheetOpen}
				mode={selectedIdentity ? "edit" : "create"}
				identity={selectedIdentity ?? undefined}
				tenantId={tenantId}
			/>

			{/* Delete confirmation */}
			<AlertDialog
				open={!!deleteTarget}
				onOpenChange={(open) => !open && setDeleteTarget(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Remove identity?</AlertDialogTitle>
						<AlertDialogDescription>
							<strong>{deleteTarget?.username}</strong> will be soft-deleted and
							will no longer be able to sign in. This can be undone by an
							administrator.
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
