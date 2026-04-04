import type { IdentitySafe } from "@r6/schemas";
import { useQueryClient } from "@tanstack/react-query";
import { Building2, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useState } from "react";
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

const PAGE_SIZE = 20;

export default function IdentitiesPage() {
	const { claims } = useAuth();
	const isAdmin = claims?.kind === "ADMIN";
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
		{ staleTime: 5 * 60 * 1000 },
	);

	const [page, setPage] = useState(1);
	const [sheetOpen, setSheetOpen] = useState(false);
	const [editTarget, setEditTarget] = useState<IdentitySafe | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<IdentitySafe | null>(null);

	const { data, isLoading } = useListIdentitiesQuery(
		activeTenantSlug,
		{ page, limit: PAGE_SIZE },
		{ staleTime: 5 * 60 * 1000 },
	);

	const removeMutation = useRemoveIdentityMutation();
	const restoreMutation = useRestoreIdentityMutation();

	const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1;

	function handleEdit(identity: IdentitySafe) {
		if (isAdmin) return;
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
		if (!deleteTarget || isAdmin) return;
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
		if (isAdmin) return;
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
		<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-xl font-semibold">Identities</h1>
					<p className="text-sm text-muted-foreground">
						Manage user and service accounts.
					</p>
				</div>
				{!isAdmin && (
					<Button onClick={() => setSheetOpen(true)}>
						<Plus />
						New Identity
					</Button>
				)}
			</div>

			<div className="rounded-xl border bg-card overflow-hidden">
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
								setPage(1);
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
						isAdmin={isAdmin}
					/>
				)}
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

			<IdentitySheet
				open={sheetOpen}
				onOpenChange={handleSheetOpenChange}
				tenantSlug={activeTenantSlug}
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
