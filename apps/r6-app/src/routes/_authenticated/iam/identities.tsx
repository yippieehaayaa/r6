import { createFileRoute, redirect } from "@tanstack/react-router";
import IdentitiesPage from "@/features/iam/identities/page";

export const Route = createFileRoute("/_authenticated/iam/identities")({
	beforeLoad: ({ context }) => {
		if (!context.auth.hasPermission("iam:identity:read")) {
			throw redirect({ to: "/forbidden" });
		}
	},
	component: IdentitiesPage,
});
