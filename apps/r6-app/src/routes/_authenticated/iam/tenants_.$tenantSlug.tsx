import { createFileRoute, redirect } from "@tanstack/react-router";
import TenantDetailPage from "@/features/iam/tenants/detail/page";

export const Route = createFileRoute(
	"/_authenticated/iam/tenants_/$tenantSlug",
)({
	beforeLoad: ({ context }) => {
		if (context.auth.claims?.kind !== "ADMIN") {
			throw redirect({ to: "/forbidden" });
		}
	},
	component: TenantDetailPage,
});
