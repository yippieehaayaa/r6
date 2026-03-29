import type { Policy } from "@r6/schemas";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
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
import { PoliciesTable } from "./policies-table";
import { PolicySheet } from "./policy-sheet";

const PAGE_SIZE = 20;

export default function PoliciesPage() {
	const { claims } = useAuth();
	const tenantSlug = claims?.tenantSlug ?? "";
	const queryClient = useQueryClient();

	const [page, setPage] = useState(1);
	const [sheetOpen, setSheetOpen] = useState(false);
	const [editTarget, setEditTarget] = useState<Policy | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<Policy | null>(null);

	const { data, isLoading } = useListPoliciesQuery(
		tenantSlug,
		{ page, limit: PAGE_SIZE },
		{ staleTime: 5 * 60 * 1000 },
	);

	const removeMutation = useRemovePolicyMutation();
	const restoreMutation = useRestorePolicyMutation();

	const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1;

	function handleEdit(policy: Policy) {
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
		if (!deleteTarget) return;
		removeMutation.mutate(
			{ tenantSlug, id: deleteTarget.id },
			{
				onSuccess: () => {
					queryClient.invalidateQueries({ queryKey: ["policies", tenantSlug] });
					toast.success("Policy deleted.");
					setDeleteTarget(null);
				},
				onError: (err) => toast.error(err.message),
			},
		);
	}

	function handleRestore(policy: Policy) {
		restoreMutation.mutate(
			{ tenantSlug, id: policy.id },
			{
				onSuccess: () => {
					queryClient.invalidateQueries({ queryKey: ["policies", tenantSlug] });
					toast.success("Policy restored.");
				},
				onError: (err) => toast.error(err.message),
			},
		);
	}

	return (
		<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-xl font-semibold">Policies</h1>
					<p className="text-sm text-muted-foreground">
						Allow / Deny rules that are attached to roles.
					</p>
				</div>
				<Button onClick={() => setSheetOpen(true)}>
					<Plus />
					New Policy
				</Button>
			</div>

			<div className="rounded-xl border bg-card overflow-hidden">
				<PoliciesTable
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

			<PolicySheet
				open={sheetOpen}
				onOpenChange={handleSheetOpenChange}
				tenantSlug={tenantSlug}
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
