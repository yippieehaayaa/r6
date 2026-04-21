import type { IdentityListItem } from "@r6/schemas";
import type { PaginationState } from "@tanstack/react-table";
import { UsersIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRemoveIdentityMutation } from "@/api/identity-and-access/tenants/identities/mutations/remove";
import { useRestoreIdentityMutation } from "@/api/identity-and-access/tenants/identities/mutations/restore";
import { useListIdentitiesQuery } from "@/api/identity-and-access/tenants/identities/queries/list";
import { useAuth } from "@/auth";
import { getApiErrorMessage } from "@/lib/api-error";
import { IdentitiesTable } from "./identities-table";
import { ManagePoliciesSheet } from "./manage-policies-sheet";

export default function IdentitiesPage() {
	const { claims } = useAuth();
	const tenantId = claims?.tenantId ?? "";

	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 20,
	});
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");

	const [policiesTarget, setPoliciesTarget] = useState<IdentityListItem | null>(
		null,
	);

	const removeMutation = useRemoveIdentityMutation();
	const restoreMutation = useRestoreIdentityMutation();

	// Debounce search input and reset page together
	useEffect(() => {
		const id = setTimeout(() => {
			setDebouncedSearch(search);
			setPagination((p) => ({ ...p, pageIndex: 0 }));
		}, 300);
		return () => clearTimeout(id);
	}, [search]);

	const { data, isLoading } = useListIdentitiesQuery(tenantId, {
		page: pagination.pageIndex + 1,
		limit: pagination.pageSize,
		search: debouncedSearch || undefined,
	});

	async function handleDelete(identity: IdentityListItem) {
		try {
			await removeMutation.mutateAsync({ tenantId, id: identity.id });
			toast.success(`${identity.username} removed`);
		} catch (err) {
			toast.error(getApiErrorMessage(err));
		}
	}

	async function handleRestore(identity: IdentityListItem) {
		try {
			await restoreMutation.mutateAsync({ tenantId, id: identity.id });
			toast.success(`${identity.username} restored`);
		} catch (err) {
			toast.error(getApiErrorMessage(err));
		}
	}

	return (
		<div className="animate-apple-enter flex flex-col gap-6 p-6 md:p-8">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-2">
					<div className="flex size-8 items-center justify-center rounded-lg bg-[var(--accent)] shadow-sm">
						<UsersIcon className="size-4 text-white" />
					</div>
					<div>
						<h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
							Identities
						</h1>
						<p className="text-sm text-muted-foreground">
							Manage users and service accounts
						</p>
					</div>
				</div>
			</div>

			{/* Table */}
			<IdentitiesTable
				data={data?.data ?? []}
				isLoading={isLoading}
				rowCount={data?.total}
				paginationState={pagination}
				onPaginationChange={setPagination}
				globalFilterValue={search}
				onGlobalFilterChange={setSearch}

				onDelete={handleDelete}
				onRestore={handleRestore}
				onManagePolicies={(row) => setPoliciesTarget(row)}
			/>

			{/* Sheets */}
			<ManagePoliciesSheet
				tenantId={tenantId}
				identity={policiesTarget}
				open={!!policiesTarget}
				onOpenChange={(open) => {
					if (!open) setPoliciesTarget(null);
				}}
			/>
		</div>
	);
}
