import { createFileRoute, isRedirect, redirect } from "@tanstack/react-router";
import { getSetupStatusFn } from "@/api/inventory/setup/queries/setup-status";
import SetupPage from "@/features/setup/page";

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

export const Route = createFileRoute("/r6/setup")({
	beforeLoad: async ({ context }) => {
		if (!context.auth.isAuthenticated) {
			throw redirect({ to: "/r6/login" });
		}
		const slug = context.auth.claims?.tenantSlug;
		if (!slug) {
			// ADMIN identities (no tenant) bypass the wizard
			throw redirect({ to: "/r6" });
		}
		try {
			const status = await context.queryClient.fetchQuery({
				queryKey: ["setup-status", slug],
				queryFn: () => getSetupStatusFn(slug),
				staleTime: 0,
			});
			if (isSetupComplete(status)) {
				throw redirect({ to: "/r6" });
			}
		} catch (err) {
			// Re-throw redirects; swallow API errors so the wizard still renders
			if (isRedirect(err)) throw err;
		}
	},
	component: SetupPage,
});
