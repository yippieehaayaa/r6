import type { Policy } from "@r6/schemas";
import { useQueryClient } from "@tanstack/react-query";
import type { PaginationState } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
	useListPoliciesQuery,
	useRemovePolicyMutation,
	useRestorePolicyMutation,
} from "@/api/policies";
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
import { PoliciesTable } from "./policies-table";
import { PolicySheet } from "./policy-sheet";

const PAGE_SIZE = 20;

export default function PoliciesPage() {
	const queryClient = useQueryClient();

	const { claims } = useAuth();
	const isAdmin = claims?.kind === "ADMIN";
	const canCreate = isAdmin;
	const canUpdate = isAdmin;
	const canDelete = isAdmin;
	const canRestore = isAdmin;

	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: PAGE_SIZE,
	});
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [sheetOpen, setSheetOpen] = useState(false);
	const [editTarget, setEditTarget] = useState<Policy | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<Policy | null>(null);

	useEffect(() => {
		const id = setTimeout(() => setDebouncedSearch(search), 300);
		return () => clearTimeout(id);
	}, [search]);

	const { data, isLoading } = useListPoliciesQuery(
		{
			page: pagination.pageIndex + 1,
			limit: pagination.pageSize,
			search: debouncedSearch || undefined,
		},
		{ staleTime: 5 * 60 * 1000 },
	);

	const removeMutation = useRemovePolicyMutation();
	const restoreMutation = useRestorePolicyMutation();

	function handleEdit(policy: Policy) {
		if (!canUpdate) return;
		setEditTarget(policy);
		setSheetOpen(true);
	}

	function handleSheetOpenChange(open: boolean) {
		setSheetOpen(open);
		if (!open) setEditTarget(null);
	}

	function handleDelete(policy: Policy) {
		setDeleteTarget(policy);
	}

	function confirmDelete() {
		if (!deleteTarget || !canDelete) return;
		removeMutation.mutate(
			{ id: deleteTarget.id },
			{
				onSuccess: () => {
					queryClient.invalidateQueries({ queryKey: ["policies"] });
					toast.success("Policy deleted.");
					setDeleteTarget(null);
				},
				onError: (err) => toast.error(getApiErrorMessage(err)),
			},
		);
	}

	function handleRestore(policy: Policy) {
		if (!canRestore) return;
		restoreMutation.mutate(
			{ id: policy.id },
			{
				onSuccess: () => {
					queryClient.invalidateQueries({ queryKey: ["policies"] });
					toast.success("Policy restored.");
				},
				onError: (err) => toast.error(getApiErrorMessage(err)),
			},
		);
	}

	return (
		<div className="flex flex-1 flex-col gap-4 p-4 pt-0 animate-stagger-children">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-xl font-semibold">Policies</h1>
					<p className="text-sm text-muted-foreground">
						Allow / Deny rules that are attached to roles.
					</p>
				</div>
				{canCreate && (
					<Button onClick={() => setSheetOpen(true)}>
						<Plus />
						New Policy
					</Button>
				)}
			</div>

			<div className="rounded-xl border bg-card p-4">
				<PoliciesTable
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

			<PolicySheet
				open={sheetOpen}
				onOpenChange={handleSheetOpenChange}
				policy={editTarget}
			/>

			<AlertDialog
				open={!!deleteTarget}
				onOpenChange={(open) => !open && setDeleteTarget(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete policy?</AlertDialogTitle>
						<AlertDialogDescription>
							<strong>{deleteTarget?.name}</strong> will be soft-deleted. Roles
							attached to this policy will lose these permissions.
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
