import { createFileRoute, redirect } from "@tanstack/react-router";
import { DefaultLayout } from "@/components/layouts/layout.default";

export const Route = createFileRoute("/_authenticated")({
	beforeLoad: ({ context }) => {
		if (!context.auth.isAuthenticated) {
			throw redirect({ to: "/login" });
		}
	},
	component: DefaultLayout,
});
