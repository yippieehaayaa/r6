import type { IdentitySafe, Role } from "@r6/schemas";
import { getRouteApi, Link } from "@tanstack/react-router";
import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import { useListIdentitiesQuery } from "@/api/identities";
import { useListRolesQuery } from "@/api/roles";
import { useGetTenantQuery } from "@/api/tenants";
import { DataTable } from "@/components/table/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { IdentityDetailSheet } from "./identity-detail-sheet";

const routeApi = getRouteApi("/_authenticated/iam/tenants_/$tenantSlug");

const PAGE_SIZE = 20;

const identityColumns: ColumnDef<IdentitySafe>[] = [
	{
		accessorKey: "username",
		header: "Username",
		cell: ({ row }) => (
			<span className="font-medium">{row.original.username}</span>
		),
	},
	{
		accessorKey: "email",
		header: "Email",
		cell: ({ row }) => (
			<span className="text-muted-foreground">{row.original.email ?? "—"}</span>
		),
	},
	{
		accessorKey: "kind",
		header: "Kind",
		cell: ({ row }) => <Badge variant="outline">{row.original.kind}</Badge>,
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => (
			<Badge
				variant={row.original.status === "ACTIVE" ? "default" : "secondary"}
			>
				{row.original.status}
			</Badge>
		),
	},
	{
		accessorKey: "createdAt",
		header: "Created",
		cell: ({ row }) => (
			<span className="text-muted-foreground text-xs">
				{new Date(row.original.createdAt).toLocaleDateString()}
			</span>
		),
	},
];

const roleColumns: ColumnDef<Role>[] = [
	{
		accessorKey: "name",
		header: "Name",
		cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
	},
	{
		accessorKey: "description",
		header: "Description",
		cell: ({ row }) => (
			<span className="text-muted-foreground">
				{row.original.description ?? "—"}
			</span>
		),
	},
	{
		accessorKey: "isActive",
		header: "Status",
		cell: ({ row }) => (
			<Badge variant={row.original.isActive ? "default" : "secondary"}>
				{row.original.isActive ? "Active" : "Inactive"}
			</Badge>
		),
	},
	{
		accessorKey: "createdAt",
		header: "Created",
		cell: ({ row }) => (
			<span className="text-muted-foreground text-xs">
				{new Date(row.original.createdAt).toLocaleDateString()}
			</span>
		),
	},
];

export default function TenantDetailPage() {
	const { tenantSlug } = routeApi.useParams();

	const [identityPagination, setIdentityPagination] = useState<PaginationState>(
		{ pageIndex: 0, pageSize: PAGE_SIZE },
	);
	const [identitySearch, setIdentitySearch] = useState("");

	const [rolePagination, setRolePagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: PAGE_SIZE,
	});
	const [roleSearch, setRoleSearch] = useState("");

	const [selectedIdentityId, setSelectedIdentityId] = useState<string | null>(
		null,
	);

	const { data: tenant, isLoading: tenantLoading } =
		useGetTenantQuery(tenantSlug);

	const { data: identities, isLoading: identitiesLoading } =
		useListIdentitiesQuery(tenantSlug, {
			page: identityPagination.pageIndex + 1,
			limit: identityPagination.pageSize,
			search: identitySearch || undefined,
		});

	const { data: roles, isLoading: rolesLoading } = useListRolesQuery(
		tenantSlug,
		{
			page: rolePagination.pageIndex + 1,
			limit: rolePagination.pageSize,
			search: roleSearch || undefined,
		},
	);

	return (
		<div className="flex flex-1 flex-col gap-6 p-4 pt-0 animate-stagger-children">
			{/* Back navigation */}
			<div>
				<Button variant="ghost" size="sm" className="-ml-2" asChild>
					<Link to="/iam/tenants">
						<ChevronLeft className="size-4" />
						Tenants
					</Link>
				</Button>
			</div>

			{/* Tenant header */}
			<div className="rounded-xl border bg-card p-6">
				{tenantLoading ? (
					<div className="flex flex-col gap-3">
						<Skeleton className="h-6 w-48" />
						<Skeleton className="h-4 w-32" />
						<Skeleton className="h-4 w-64" />
					</div>
				) : tenant ? (
					<div className="flex flex-col gap-3">
						<div className="flex items-center gap-3">
							<h1 className="text-xl font-semibold">{tenant.name}</h1>
							<Badge variant={tenant.isActive ? "default" : "secondary"}>
								{tenant.isActive ? "Active" : "Inactive"}
							</Badge>
						</div>
						<span className="font-mono text-xs text-muted-foreground">
							{tenant.slug}
						</span>
						{tenant.moduleAccess.length > 0 && (
							<div className="flex flex-wrap gap-1">
								{tenant.moduleAccess.map((m) => (
									<Badge key={m} variant="outline">
										{m}
									</Badge>
								))}
							</div>
						)}
					</div>
				) : null}
			</div>

			{/* Identities section */}
			<div className="rounded-xl border bg-card p-4">
				<div className="mb-4">
					<h2 className="text-base font-semibold">Identities</h2>
					<p className="text-sm text-muted-foreground">
						Members belonging to this tenant.
					</p>
				</div>
				<DataTable
					columns={identityColumns}
					data={identities?.data ?? []}
					isLoading={identitiesLoading}
					rowCount={identities?.total}
					paginationState={identityPagination}
					onPaginationChange={setIdentityPagination}
					globalFilterValue={identitySearch}
					onGlobalFilterChange={(v) => {
						setIdentitySearch(v);
						setIdentityPagination((p) => ({ ...p, pageIndex: 0 }));
					}}
					filterPlaceholder="Search identities…"
					onRowClick={(identity) => setSelectedIdentityId(identity.id)}
				/>
			</div>

			{/* Roles section */}
			<div className="rounded-xl border bg-card p-4">
				<div className="mb-4">
					<h2 className="text-base font-semibold">Roles</h2>
					<p className="text-sm text-muted-foreground">
						Roles defined under this tenant.
					</p>
				</div>
				<DataTable
					columns={roleColumns}
					data={roles?.data ?? []}
					isLoading={rolesLoading}
					rowCount={roles?.total}
					paginationState={rolePagination}
					onPaginationChange={setRolePagination}
					globalFilterValue={roleSearch}
					onGlobalFilterChange={(v) => {
						setRoleSearch(v);
						setRolePagination((p) => ({ ...p, pageIndex: 0 }));
					}}
					filterPlaceholder="Search roles…"
				/>
			</div>

			{/* Identity detail drawer */}
			<IdentityDetailSheet
				open={!!selectedIdentityId}
				onOpenChange={(open) => !open && setSelectedIdentityId(null)}
				tenantSlug={tenantSlug}
				identityId={selectedIdentityId}
			/>
		</div>
	);
}
