import { createFileRoute, isRedirect, redirect } from "@tanstack/react-router";
import { getSetupStatusFn } from "@/api/inventory/setup/queries/setup-status";
import { DefaultLayout } from "@/components/layouts/layout.default";
import { LayoutSkeleton } from "@/components/layouts/layout.skeleton";

function isSetupComplete(status: {
	isOnboarded: boolean;
	hasBaseUom: boolean;
	hasWarehouse: boolean;
	hasAdditionalUoms: boolean;
	hasCategories: boolean;
	hasBrands: boolean;
}): boolean {
	return (
		status.isOnboarded &&
		status.hasBaseUom &&
		status.hasWarehouse &&
		status.hasAdditionalUoms &&
		status.hasCategories &&
		status.hasBrands
	);
}

export const Route = createFileRoute("/r6/_authenticated")({
	beforeLoad: async ({ context }) => {
		if (!context.auth.isAuthenticated) {
			throw redirect({ to: "/r6/login" });
		}
		const slug = context.auth.claims?.tenantSlug;
		if (slug) {
			try {
				const status = await context.queryClient.fetchQuery({
					queryKey: ["setup-status", slug],
					queryFn: () => getSetupStatusFn(slug),
					staleTime: 5 * 60 * 1000,
				});
				if (!isSetupComplete(status)) {
					throw redirect({ to: "/r6/setup" });
				}
			} catch (err) {
				// Re-throw redirects; swallow API errors (service unavailable, timeout, etc.)
				if (isRedirect(err)) throw err;
			}
		}
	},
	pendingComponent: LayoutSkeleton,
	pendingMs: 300,
	pendingMinMs: 500,
	component: DefaultLayout,
});
