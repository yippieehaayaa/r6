import { createFileRoute, redirect } from "@tanstack/react-router";
import IamOverviewPage from "@/features/iam/overview/page";

export const Route = createFileRoute("/r6/_authenticated/iam/")({
	beforeLoad: ({ context }) => {
		if (!context.auth.hasPermission("iam:identity:read")) {
			throw redirect({ to: "/r6/forbidden" });
		}
	},
	component: IamOverviewPage,
});
