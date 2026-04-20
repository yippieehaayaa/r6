import { Link } from "@tanstack/react-router";
import {
	BuildingIcon,
	ShieldCheckIcon,
	ShieldIcon,
	UsersIcon,
} from "lucide-react";
import {
	useListIdentitiesQuery,
	useListPoliciesQuery,
	useListTenantsQuery,
} from "@/api/identity-and-access";
import { useAuth } from "@/auth";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// ── Stat card ─────────────────────────────────────────────────

interface StatCardProps {
	title: string;
	value: number | undefined;
	description: string;
	isLoading: boolean;
	icon: React.ReactNode;
	to: string;
	accent: string;
}

function StatCard({
	title,
	value,
	description,
	isLoading,
	icon,
	to,
	accent,
}: StatCardProps) {
	return (
		<Link to={to} className="block group">
			<Card className="h-full transition-all hover:shadow-md hover:border-[var(--accent)]/30 group-hover:bg-[var(--surface)]">
				<CardHeader className="flex flex-row items-center justify-between pb-2">
					<CardTitle className="text-sm font-medium text-[var(--text-secondary)]">
						{title}
					</CardTitle>
					<div
						className={`flex size-9 items-center justify-center rounded-xl ${accent}`}
					>
						{icon}
					</div>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<Skeleton className="h-8 w-16" />
					) : (
						<p className="text-3xl font-bold text-[var(--text-primary)] tabular-nums">
							{value?.toLocaleString() ?? "—"}
						</p>
					)}
					<p className="mt-1 text-xs text-[var(--text-secondary)]">
						{description}
					</p>
				</CardContent>
			</Card>
		</Link>
	);
}

// ── IAM overview ──────────────────────────────────────────────

export default function IamPage() {
	const { claims } = useAuth();
	const tenantId = claims?.tenantId ?? "";

	const { data: identities, isLoading: loadingIdentities } =
		useListIdentitiesQuery(tenantId, { page: 1, limit: 1 });
	const { data: tenants, isLoading: loadingTenants } = useListTenantsQuery({
		page: 1,
		limit: 1,
	});
	const { data: policies, isLoading: loadingPolicies } = useListPoliciesQuery(
		tenantId,
		{
			page: 1,
			limit: 1,
		},
	);

	return (
		<div className="animate-apple-enter flex flex-1 flex-col gap-8 p-6">
			{/* Header */}
			<div>
				<h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
					Identity & Access
				</h1>
				<p className="mt-1 text-sm text-[var(--text-secondary)]">
					Overview of users, tenants, and permission policies
				</p>
			</div>

			{/* Stat cards */}
			<div className="animate-stagger-children grid gap-4 sm:grid-cols-3">
				<StatCard
					title="Identities"
					value={identities?.total}
					description="Users and service accounts"
					isLoading={loadingIdentities}
					icon={<UsersIcon className="size-4 text-[var(--accent)]" />}
					to="/r6/iam/identities"
					accent="bg-[var(--accent)]/10"
				/>
				<StatCard
					title="Tenants"
					value={tenants?.total}
					description="Registered organisations"
					isLoading={loadingTenants}
					icon={
						<BuildingIcon className="size-4 text-[var(--badge-in-stock)]" />
					}
					to="/r6/iam/tenants"
					accent="bg-[var(--badge-in-stock)]/10"
				/>
				<StatCard
					title="Policies"
					value={policies?.total}
					description="Named permission sets"
					isLoading={loadingPolicies}
					icon={
						<ShieldCheckIcon className="size-4 text-[var(--badge-low-stock)]" />
					}
					to="/r6/iam/policies"
					accent="bg-[var(--badge-low-stock)]/10"
				/>
			</div>

			{/* Quick links */}
			<div className="flex flex-col gap-3">
				<h2 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wide">
					Quick Actions
				</h2>
				<div className="grid gap-3 sm:grid-cols-3">
					{[
						{
							label: "Manage Identities",
							description: "Create, edit and manage users",
							to: "/r6/iam/identities",
							icon: <UsersIcon className="size-5 text-[var(--accent)]" />,
						},
						{
							label: "Manage Tenants",
							description: "Configure tenant organisations",
							to: "/r6/iam/tenants",
							icon: (
								<BuildingIcon className="size-5 text-[var(--badge-in-stock)]" />
							),
						},
						{
							label: "Manage Policies",
							description: "Define permission sets",
							to: "/r6/iam/policies",
							icon: (
								<ShieldIcon className="size-5 text-[var(--badge-low-stock)]" />
							),
						},
					].map((item) => (
						<Link key={item.to} to={item.to} className="block group">
							<Card className="h-full transition-all hover:shadow-md hover:border-[var(--accent)]/30">
								<CardContent className="flex items-center gap-4 pt-5 pb-5">
									<div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--surface)]">
										{item.icon}
									</div>
									<div>
										<p className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
											{item.label}
										</p>
										<p className="text-xs text-[var(--text-secondary)]">
											{item.description}
										</p>
									</div>
								</CardContent>
							</Card>
						</Link>
					))}
				</div>
			</div>
		</div>
	);
}
