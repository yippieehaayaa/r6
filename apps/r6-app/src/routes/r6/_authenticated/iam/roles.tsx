import { createFileRoute, redirect } from "@tanstack/react-router";
import RolesPage from "@/features/iam/roles/page";

export const Route = createFileRoute("/r6/_authenticated/iam/roles")({
	beforeLoad: ({ context }) => {
		if (!context.auth.hasPermission("iam:role:read")) {
			throw redirect({ to: "/r6/forbidden" });
		}
	},
	component: RolesPage,
});
