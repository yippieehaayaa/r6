import { createFileRoute, redirect } from "@tanstack/react-router";
import TenantsPage from "@/features/iam/tenants/page";

export const Route = createFileRoute("/r6/_authenticated/iam/tenants")({
	beforeLoad: ({ context }) => {
		if (context.auth.claims?.kind !== "ADMIN") {
			throw redirect({ to: "/r6/forbidden" });
		}
	},
	component: TenantsPage,
});
