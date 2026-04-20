import type { PaginationState } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { useListPoliciesQuery } from "@/api/identity-and-access/policies";
import { useAuth } from "@/auth";
import { PoliciesTable } from "./policies-table";

const PAGE_SIZE = 20;

export default function PoliciesPage() {
	const { claims } = useAuth();
	const activeTenantId = claims?.tenantId ?? "";

	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: PAGE_SIZE,
	});
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");

	useEffect(() => {
		const id = setTimeout(() => setDebouncedSearch(search), 300);
		return () => clearTimeout(id);
	}, [search]);

	const { data, isLoading } = useListPoliciesQuery(
		activeTenantId,
		{
			page: pagination.pageIndex + 1,
			limit: pagination.pageSize,
			search: debouncedSearch || undefined,
		},
		{ staleTime: 5 * 60 * 1000 },
	);

	return (
		<div className="flex flex-1 flex-col gap-4 p-4 pt-0 animate-stagger-children">
			<div>
				<h1 className="text-xl font-semibold">Policies</h1>
				<p className="text-sm text-muted-foreground">
					Permission sets that can be assigned to identities.
				</p>
			</div>

			<div className="rounded-xl border-default bg-surface p-4">
				<PoliciesTable
					data={data?.data ?? []}
					isLoading={isLoading}
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
		</div>
	);
}
