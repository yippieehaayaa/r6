import type { PaginationState } from "@tanstack/react-table";
import { KeyRoundIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useListPoliciesQuery } from "@/api/identity-and-access/tenants/policies/queries/list";
import { useAuth } from "@/auth";
import { PoliciesTable } from "./policies-table";

export default function PoliciesPage() {
	const { claims } = useAuth();
	const tenantId = claims?.tenantId ?? "";

	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 20,
	});
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");

	// Debounce search input and reset page together
	useEffect(() => {
		const id = setTimeout(() => {
			setDebouncedSearch(search);
			setPagination((p) => ({ ...p, pageIndex: 0 }));
		}, 300);
		return () => clearTimeout(id);
	}, [search]);

	const { data, isLoading } = useListPoliciesQuery(tenantId, {
		page: pagination.pageIndex + 1,
		limit: pagination.pageSize,
		search: debouncedSearch || undefined,
	});

	return (
		<div className="animate-apple-enter flex flex-col gap-6 p-6 md:p-8">
			{/* Header */}
			<div className="flex flex-col gap-1">
				<div className="flex items-center gap-2">
					<div className="flex size-8 items-center justify-center rounded-lg bg-[var(--accent)] shadow-sm">
						<KeyRoundIcon className="size-4 text-white" />
					</div>
					<div>
						<h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
							Policies
						</h1>
						<p className="text-sm text-muted-foreground">
							Permission sets available in this tenant
						</p>
					</div>
				</div>
			</div>

			{/* Table */}
			<PoliciesTable
				data={data?.data ?? []}
				isLoading={isLoading}
				rowCount={data?.total}
				paginationState={pagination}
				onPaginationChange={setPagination}
				globalFilterValue={search}
				onGlobalFilterChange={setSearch}
			/>
		</div>
	);
}
