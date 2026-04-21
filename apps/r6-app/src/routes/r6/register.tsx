import { createFileRoute, redirect } from "@tanstack/react-router";
import RegisterPage from "#/features/auth/register-page";

export const Route = createFileRoute("/r6/register")({
	beforeLoad: ({ context }) => {
		if (context.auth.isAuthenticated) {
			throw redirect({ to: "/r6" });
		}
	},
	component: RegisterPage,
});
