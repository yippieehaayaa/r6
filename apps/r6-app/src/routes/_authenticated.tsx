import { createFileRoute, redirect } from "@tanstack/react-router";
import { DefaultLayout } from "@/components/layouts/layout.default";
import { LayoutSkeleton } from "@/components/layouts/layout.skeleton";

export const Route = createFileRoute("/_authenticated")({
	beforeLoad: ({ context }) => {
		if (!context.auth.isAuthenticated) {
			throw redirect({ to: "/login" });
		}
	},
	pendingComponent: LayoutSkeleton,
	pendingMs: 300,
	pendingMinMs: 500,
	component: DefaultLayout,
});
