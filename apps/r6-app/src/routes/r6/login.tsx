import { createFileRoute, redirect } from "@tanstack/react-router";
import LoginPage from "#/features/auth/login-page";

export const Route = createFileRoute("/r6/login")({
	beforeLoad: ({ context }) => {
		if (context.auth.isAuthenticated) {
			throw redirect({ to: "/r6" });
		}
	},
	component: LoginPage,
});
