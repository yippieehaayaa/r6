import { createFileRoute, redirect } from "@tanstack/react-router";
import TenantDetailPage from "@/features/iam/tenants/detail/page";

export const Route = createFileRoute(
	"/r6/_authenticated/iam/tenants_/$tenantId",
)({
	beforeLoad: ({ context }) => {
		if (context.auth.claims?.kind !== "ADMIN") {
			throw redirect({ to: "/r6/forbidden" });
		}
	},
	component: TenantDetailPage,
});
