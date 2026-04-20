import type { Policy } from "@r6/schemas";
import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import {
	LockIcon,
	PlusIcon,
	RotateCcwIcon,
	ShieldIcon,
	Trash2Icon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
	useListPoliciesQuery,
	useRemovePolicyMutation,
	useRestorePolicyMutation,
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
import { PolicySheet } from "./policy-sheet";

export default function PoliciesPage() {
	const { claims } = useAuth();
	const tenantId = claims?.tenantId ?? "";

	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 20,
	});
	const [search, setSearch] = useState("");

	const [sheetOpen, setSheetOpen] = useState(false);
	const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);

	const [deleteTarget, setDeleteTarget] = useState<Policy | null>(null);

	const { data, isLoading } = useListPoliciesQuery(tenantId, {
		page: pagination.pageIndex + 1,
		limit: pagination.pageSize,
		search: search || undefined,
	});

	const removeMutation = useRemovePolicyMutation();
	const restoreMutation = useRestorePolicyMutation();

	function openCreate() {
		setSelectedPolicy(null);
		setSheetOpen(true);
	}

	function openEdit(policy: Policy) {
		if (policy.isManaged) return; // managed policies are read-only
		setSelectedPolicy(policy);
		setSheetOpen(true);
	}

	async function handleDelete() {
		if (!deleteTarget) return;
		try {
			await removeMutation.mutateAsync({ tenantId, id: deleteTarget.id });
			toast.success(`Policy "${deleteTarget.name}" removed.`);
		} catch (err) {
			toast.error(getApiErrorMessage(err));
		} finally {
			setDeleteTarget(null);
		}
	}

	async function handleRestore(policy: Policy) {
		try {
			await restoreMutation.mutateAsync({ tenantId, id: policy.id });
			toast.success(`Policy "${policy.name}" restored.`);
		} catch (err) {
			toast.error(getApiErrorMessage(err));
		}
	}

	const columns: ColumnDef<Policy>[] = [
		{
			accessorKey: "name",
			header: "Name",
			cell: ({ row }) => (
				<div className="flex items-center gap-2">
					{row.original.isManaged && (
						<LockIcon className="size-3 text-[var(--text-secondary)] shrink-0" />
					)}
					<span className="font-mono text-sm text-[var(--text-primary)]">
						{row.original.name}
					</span>
				</div>
			),
		},
		{
			accessorKey: "displayName",
			header: "Display Name",
			cell: ({ getValue }) => (
				<span className="text-sm text-[var(--text-secondary)]">
					{(getValue() as string | null) ?? "—"}
				</span>
			),
		},
		{
			accessorKey: "permissions",
			header: "Permissions",
			cell: ({ getValue }) => {
				const perms = getValue() as string[];
				return (
					<Badge variant="secondary" className="text-xs tabular-nums">
						{perms.length} permission{perms.length !== 1 ? "s" : ""}
					</Badge>
				);
			},
		},
		{
			accessorKey: "isManaged",
			header: "",
			cell: ({ getValue }) =>
				getValue() ? (
					<Badge
						variant="outline"
						className="text-xs bg-[var(--badge-low-stock)]/15 text-[var(--badge-low-stock)] border-[var(--badge-low-stock)]/30"
					>
						Managed
					</Badge>
				) : null,
		},
		{
			id: "actions",
			header: "",
			cell: ({ row }) => {
				const policy = row.original;
				if (policy.isManaged) return null;
				const isDeleted = !!policy.deletedAt;
				return (
					<div className="flex items-center justify-end gap-1">
						{isDeleted ? (
							<Can permission="iam:policy:restore">
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 text-[var(--text-secondary)]"
									onClick={(e) => {
										e.stopPropagation();
										handleRestore(policy);
									}}
									title="Restore policy"
								>
									<RotateCcwIcon className="size-3.5" />
								</Button>
							</Can>
						) : (
							<Can permission="iam:policy:delete">
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 text-[var(--badge-out-of-stock)] hover:text-[var(--badge-out-of-stock)] hover:bg-[var(--badge-out-of-stock)]/10"
									onClick={(e) => {
										e.stopPropagation();
										setDeleteTarget(policy);
									}}
									title="Remove policy"
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
						Policies
					</h1>
					<p className="mt-1 text-sm text-[var(--text-secondary)]">
						Define permission sets that can be assigned to roles
					</p>
				</div>
				<Can permission="iam:policy:create">
					<Button
						onClick={openCreate}
						className="bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white border-0 shadow-sm"
					>
						<PlusIcon className="size-4" />
						New Policy
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
				filterPlaceholder="Search policies…"
				onRowClick={(policy) => !policy.isManaged && openEdit(policy)}
			/>

			<PolicySheet
				open={sheetOpen}
				onOpenChange={setSheetOpen}
				mode={selectedPolicy ? "edit" : "create"}
				policy={selectedPolicy ?? undefined}
				tenantId={tenantId}
			/>

			<AlertDialog
				open={!!deleteTarget}
				onOpenChange={(open) => !open && setDeleteTarget(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Remove policy?</AlertDialogTitle>
						<AlertDialogDescription>
							<strong>{deleteTarget?.name}</strong> will be soft-deleted and
							removed from all roles that reference it.
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
