import { Link } from "@tanstack/react-router";
import { Building2, KeyRound, ShieldCheck, Users } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

const stats = [
	{
		title: "Identities",
		description: "User and service accounts",
		value: 128,
		icon: Users,
		href: "/iam/identities",
	},
	{
		title: "Roles",
		description: "Permission groups assigned to identities",
		value: 14,
		icon: ShieldCheck,
		href: "/iam/roles",
	},
	{
		title: "Policies",
		description: "Allow / Deny rules attached to roles",
		value: 42,
		icon: KeyRound,
		href: "/iam/policies",
	},
	{
		title: "Tenants",
		description: "Active client organisations",
		value: 8,
		icon: Building2,
		href: "/iam/tenants",
	},
];

export default function IamOverviewPage() {
	return (
		<div className="flex flex-1 flex-col gap-6 p-4 pt-0 animate-stagger-children">
			<div>
				<h1 className="text-xl font-semibold">Identity & Access</h1>
				<p className="text-sm text-muted-foreground">
					Manage identities, roles, policies, and tenants.
				</p>
			</div>

			<div className="animate-stagger-children grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{stats.map((stat) => (
					<Link key={stat.href} to={stat.href}>
						<Card className="transition-shadow hover:shadow-md cursor-pointer h-full">
							<CardHeader>
								<div className="flex items-center justify-between">
									<CardTitle className="text-sm font-medium text-muted-foreground">
										{stat.title}
									</CardTitle>
									<stat.icon className="size-4 text-muted-foreground" />
								</div>
								<div className="text-3xl font-bold">{stat.value}</div>
							</CardHeader>
							<CardContent>
								<CardDescription>{stat.description}</CardDescription>
							</CardContent>
						</Card>
					</Link>
				))}
			</div>
		</div>
	);
}
