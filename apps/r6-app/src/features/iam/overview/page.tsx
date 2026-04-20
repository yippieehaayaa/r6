import { Link } from "@tanstack/react-router";
import {
	KeyRoundIcon,
	MailIcon,
	ShieldCheckIcon,
	UsersIcon,
} from "lucide-react";
import { useListIdentitiesQuery } from "@/api/identity-and-access/tenants/identities/queries/list";
import { useListPoliciesQuery } from "@/api/identity-and-access/tenants/policies/queries/list";
import { useListInvitationsQuery } from "@/api/identity-and-access/tenants/queries/list-invitations";
import { useAuth } from "@/auth";
import { Can } from "@/components/can";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function StatCard({
	title,
	description,
	value,
	icon: Icon,
	href,
	isLoading,
}: {
	title: string;
	description: string;
	value?: number;
	icon: React.ElementType;
	href: string;
	isLoading: boolean;
}) {
	return (
		<Link to={href}>
			<Card className="group relative overflow-hidden border-0 ring-1 ring-foreground/8 transition-all duration-200 hover:ring-foreground/20 hover:shadow-sm dark:ring-foreground/10 dark:hover:ring-foreground/20">
				<CardHeader className="flex flex-row items-start justify-between pb-2">
					<div className="flex flex-col gap-0.5">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							{title}
						</CardTitle>
						{isLoading ? (
							<Skeleton className="h-8 w-16" />
						) : (
							<span className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
								{value?.toLocaleString() ?? "—"}
							</span>
						)}
					</div>
					<div className="flex size-10 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
						<Icon className="size-5" />
					</div>
				</CardHeader>
				<CardContent>
					<CardDescription className="text-xs">{description}</CardDescription>
				</CardContent>
			</Card>
		</Link>
	);
}

export default function IamOverviewPage() {
	const { claims } = useAuth();
	const tenantId = claims?.tenantId ?? "";

	const identitiesQuery = useListIdentitiesQuery(tenantId, {
		page: 1,
		limit: 1,
	});
	const policiesQuery = useListPoliciesQuery(tenantId, { page: 1, limit: 1 });
	const invitationsQuery = useListInvitationsQuery(tenantId, {
		page: 1,
		limit: 1,
	});

	return (
		<div className="animate-apple-enter flex flex-col gap-8 p-6 md:p-8">
			{/* Header */}
			<div className="flex flex-col gap-1.5">
				<div className="flex items-center gap-2">
					<div className="flex size-8 items-center justify-center rounded-lg bg-[var(--accent)] shadow-sm">
						<ShieldCheckIcon className="size-4 text-white" />
					</div>
					<h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
						Identity & Access
					</h1>
				</div>
				<p className="text-sm text-muted-foreground">
					Manage identities, policies, and tenant access controls.
				</p>
			</div>

			{/* Stat cards */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<Can permission="iam:identity:read">
					<StatCard
						title="Total Identities"
						description="Users and service accounts in this tenant"
						value={identitiesQuery.data?.total}
						icon={UsersIcon}
						href="/r6/iam/identities"
						isLoading={identitiesQuery.isLoading}
					/>
				</Can>

				<Can permission="iam:policy:read">
					<StatCard
						title="Policies"
						description="Permission sets assigned to identities"
						value={policiesQuery.data?.total}
						icon={KeyRoundIcon}
						href="/r6/iam/policies"
						isLoading={policiesQuery.isLoading}
					/>
				</Can>

				<Can permission="iam:invitation:read">
					<StatCard
						title="Pending Invitations"
						description="Open invitations awaiting acceptance"
						value={invitationsQuery.data?.total}
						icon={MailIcon}
						href="/r6/iam/tenants"
						isLoading={invitationsQuery.isLoading}
					/>
				</Can>
			</div>

			{/* Quick links */}
			<div className="flex flex-col gap-3">
				<h2 className="text-sm font-medium text-muted-foreground">
					Quick Actions
				</h2>
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
					<Can permission="iam:identity:read">
						<Link to="/r6/iam/identities">
							<Card className="border-0 ring-1 ring-foreground/8 transition-all duration-200 hover:ring-foreground/20 hover:shadow-sm dark:ring-foreground/10">
								<CardContent className="flex items-center gap-3 p-4">
									<UsersIcon className="size-4 text-[var(--accent)] shrink-0" />
									<div className="min-w-0">
										<p className="truncate text-sm font-medium text-[var(--text-primary)]">
											Manage Identities
										</p>
										<p className="truncate text-xs text-muted-foreground">
											Create, update, and remove users
										</p>
									</div>
									<Badge variant="outline" className="ml-auto shrink-0">
										Open
									</Badge>
								</CardContent>
							</Card>
						</Link>
					</Can>

					<Can permission="iam:policy:read">
						<Link to="/r6/iam/policies">
							<Card className="border-0 ring-1 ring-foreground/8 transition-all duration-200 hover:ring-foreground/20 hover:shadow-sm dark:ring-foreground/10">
								<CardContent className="flex items-center gap-3 p-4">
									<KeyRoundIcon className="size-4 text-[var(--accent)] shrink-0" />
									<div className="min-w-0">
										<p className="truncate text-sm font-medium text-[var(--text-primary)]">
											View Policies
										</p>
										<p className="truncate text-xs text-muted-foreground">
											Browse permission sets for this tenant
										</p>
									</div>
									<Badge variant="outline" className="ml-auto shrink-0">
										Open
									</Badge>
								</CardContent>
							</Card>
						</Link>
					</Can>

					<Can permission="iam:invitation:create">
						<Link to="/r6/iam/tenants">
							<Card className="border-0 ring-1 ring-foreground/8 transition-all duration-200 hover:ring-foreground/20 hover:shadow-sm dark:ring-foreground/10">
								<CardContent className="flex items-center gap-3 p-4">
									<MailIcon className="size-4 text-[var(--accent)] shrink-0" />
									<div className="min-w-0">
										<p className="truncate text-sm font-medium text-[var(--text-primary)]">
											Invite Members
										</p>
										<p className="truncate text-xs text-muted-foreground">
											Send invitations to join this tenant
										</p>
									</div>
									<Badge variant="outline" className="ml-auto shrink-0">
										Open
									</Badge>
								</CardContent>
							</Card>
						</Link>
					</Can>
				</div>
			</div>
		</div>
	);
}
