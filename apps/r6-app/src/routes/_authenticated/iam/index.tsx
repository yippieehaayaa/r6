import { createFileRoute, redirect } from "@tanstack/react-router";
import IamOverviewPage from "@/features/iam/overview/page";

export const Route = createFileRoute("/_authenticated/iam/")({
	beforeLoad: ({ context }) => {
		if (!context.auth.hasPermission("iam:identity:read")) {
			throw redirect({ to: "/forbidden" });
		}
	},
	component: IamOverviewPage,
});
