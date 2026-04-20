import { Link } from "@tanstack/react-router";
import { BuildingIcon, ShieldIcon, UsersIcon } from "lucide-react";
import { useGetMeQuery } from "@/api/identity-and-access";
import { useAuth } from "@/auth";
import { Card, CardContent } from "@/components/ui/card";

const IAM_LINKS = [
	{
		label: "Identities",
		description: "Manage users and service accounts",
		to: "/r6/iam/identities",
		icon: <UsersIcon className="size-5 text-[var(--accent)]" />,
		permission: "iam:identity:read",
	},
	{
		label: "Tenants",
		description: "Configure tenant organisations",
		to: "/r6/iam/tenants",
		icon: <BuildingIcon className="size-5 text-[var(--badge-in-stock)]" />,
		permission: "iam:tenant:read",
	},
	{
		label: "Policies",
		description: "Define permission sets for roles",
		to: "/r6/iam/policies",
		icon: <ShieldIcon className="size-5 text-[var(--badge-low-stock)]" />,
		permission: "iam:policy:read",
	},
] as const;

export default function DashboardPage() {
	const { data: me } = useGetMeQuery();
	const { hasPermission } = useAuth();

	const firstName = me?.firstName ?? "there";

	return (
		<div className="animate-apple-enter flex flex-1 flex-col gap-8 p-6">
			{/* Welcome */}
			<div>
				<h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
					Welcome back, {firstName} 👋
				</h1>
				<p className="mt-1 text-sm text-[var(--text-secondary)]">
					Here's an overview of your platform.
				</p>
			</div>

			{/* IAM quick nav */}
			<div className="flex flex-col gap-3">
				<h2 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wide">
					Identity & Access
				</h2>
				<div className="animate-stagger-children grid gap-3 sm:grid-cols-3">
					{IAM_LINKS.filter((l) => hasPermission(l.permission)).map((item) => (
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
