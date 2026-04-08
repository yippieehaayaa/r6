import { createFileRoute, redirect } from "@tanstack/react-router";
import PoliciesPage from "@/features/iam/policies/page";

export const Route = createFileRoute("/r6/_authenticated/iam/policies")({
	beforeLoad: ({ context }) => {
		if (!context.auth.hasPermission("iam:policy:read")) {
			throw redirect({ to: "/r6/forbidden" });
		}
	},
	component: PoliciesPage,
});
