import { GalleryVerticalEnd, MailPlus, Shield, Users } from "lucide-react";

export const data = {
	teams: [
		{
			name: "R6 Inc",
			logo: GalleryVerticalEnd,
			plan: "Enterprise",
		},
	],
	navMain: [
		{
			title: "Identity & Access",
			url: "/r6/iam",
			icon: Shield,
			items: [
				{
					title: "Overview",
					url: "/r6/iam",
					permission: "iam:identity:read",
				},
				{
					title: "Identities",
					url: "/r6/iam/identities",
					permission: "iam:identity:read",
				},
				{
					title: "Policies",
					url: "/r6/iam/policies",
					permission: "iam:policy:read",
				},
				{
					title: "Tenants",
					url: "/r6/iam/tenants",
					permission: "iam:tenant:read",
				},
			],
		},
	],
	projects: [
		{
			name: "Identities",
			url: "/r6/iam/identities",
			icon: Users,
			permission: "iam:identity:read",
		},
		{
			name: "Invite User",
			url: "/r6/iam/tenants",
			icon: MailPlus,
			permission: "iam:invitation:create",
		},
	],
};
