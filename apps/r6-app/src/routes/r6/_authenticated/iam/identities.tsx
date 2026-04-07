import { createFileRoute, redirect } from "@tanstack/react-router";
import IdentitiesPage from "@/features/iam/identities/page";

export const Route = createFileRoute("/r6/_authenticated/iam/identities")({
	beforeLoad: ({ context }) => {
		if (!context.auth.hasPermission("iam:identity:read")) {
			throw redirect({ to: "/r6/forbidden" });
		}
	},
	component: IdentitiesPage,
});
