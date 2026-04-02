import { createFileRoute, redirect } from "@tanstack/react-router";
import RolesPage from "@/features/iam/roles/page";

export const Route = createFileRoute("/_authenticated/iam/roles")({
	beforeLoad: ({ context }) => {
		if (!context.auth.hasPermission("iam:role:read")) {
			throw redirect({ to: "/forbidden" });
		}
	},
	component: RolesPage,
});
