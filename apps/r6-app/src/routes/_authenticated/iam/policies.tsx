import { createFileRoute, redirect } from "@tanstack/react-router";
import PoliciesPage from "@/features/iam/policies/page";

export const Route = createFileRoute("/_authenticated/iam/policies")({
	beforeLoad: ({ context }) => {
		if (!context.auth.hasPermission("iam:policy:read")) {
			throw redirect({ to: "/forbidden" });
		}
	},
	component: PoliciesPage,
});
